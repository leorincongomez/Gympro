import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-cambiar-en-produccion';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    // =====================================
    // 🚀 INGRESO DE ADMIN FORZADO
    // =====================================
    if (email === "admin@gmail.com" && password === "123456789") {
      let adminUser = await User.findOne({ email: "admin@gmail.com" });

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash("123456789", 10);

        adminUser = new User({
          name: "Administrador",
          email: "admin@gmail.com",
          password: hashedPassword,
          role: "admin",
          isActive: true,
        });

        await adminUser.save();
        console.log("✅ Usuario admin creado automáticamente en la base de datos");
      }

      // Crear token para el admin
      const token = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userResponse = {
        id: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        avatar: adminUser.avatar || null,
      };

      const response = NextResponse.json(
        {
          message: 'Inicio de sesión exitoso (Admin)',
          user: userResponse,
          token
        },
        { status: 200 }
      );

      // Establecer cookie de autenticación
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 días
      });

      return response;
    }
    // =====================================

    // Validaciones normales
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Correo electrónico y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario e incluir la contraseña para comparación
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' },
        { status: 403 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      trainerId: user.trainerId?.toString()
    };

    const response = NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        user: userResponse,
        token
      },
      { status: 200 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return response;

  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión', details: error.message },
      { status: 500 }
    );
  }
}
