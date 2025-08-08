// src/components/Contact.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useState } from "react";
import Swal from 'sweetalert2';

// Definimos la URL de la API siguiendo el patrón de tu proyecto.
const API_URL = import.meta.env.VITE_API_URL || "/api";

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !message) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, rellena todos los campos del formulario.',
      });
      setLoading(false);
      return;
    }

    try {
      // Usamos la variable API_URL para construir el endpoint.
      // El proxy de Vite se encargará del resto en desarrollo.
      const response = await fetch(`${API_URL}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Hubo un problema en el servidor.');
      }

      Swal.fire({
        icon: 'success',
        title: '¡Mensaje Enviado!',
        text: 'Gracias por contactarnos. Te responderemos pronto.',
      });

      setName('');
      setEmail('');
      setMessage('');

    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar el mensaje',
        text: `Error: ${error.message || 'Inténtalo de nuevo más tarde.'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Contáctanos</CardTitle>
            <CardDescription className="text-center">
              ¿Tienes alguna pregunta o sugerencia? Escríbenos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" type="text" placeholder="Tu nombre completo" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@ejemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" placeholder="Escribe tu mensaje aquí..." required value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Volver al <Link to="/" className="text-primary hover:underline">inicio</Link>.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;