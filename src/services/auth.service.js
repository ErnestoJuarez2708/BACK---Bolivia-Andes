const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

class AuthService {
  async register({ email, password, nombre }) {
    if (!email || !password) {
      throw new Error('Email y password son requeridos');
    }

    const existingUser = await prisma.usuarios.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.usuarios.create({
      data: { email, password_hash: hashed, nombre: nombre || null },
    });

    return { message: 'Usuario creado', userId: user.id };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email y password son requeridos');
    }

    const user = await prisma.usuarios.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token };
  }
}

module.exports = new AuthService();