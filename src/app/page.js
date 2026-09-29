'use client'; // 💡 Obligatorio en Next.js para usar botones y formularios

import { useState, useEffect } from 'react';
// Importamos Firebase instalado de forma profesional
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, addDoc, onSnapshot } from 'firebase/firestore';

// 1. Configuración local
const firebaseConfig = { projectId: "demo-no-project" };
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// 🚨 CONEXIÓN AL EMULADOR (Solo lo conectamos una vez para evitar errores)
if (typeof window !== 'undefined' && !db._emulatorConnected) {
  connectFirestoreEmulator(db, '127.0.0.1', 8085);
  db._emulatorConnected = true;
}

export default function Home() {
  const [texto, setTexto] = useState('');
  const [datos, setDatos] = useState([]);

  // 📖 LEER DATOS EN TIEMPO REAL
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "datos_temporales_prueba"), (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setDatos(lista);
    });
    return () => unsubscribe();
  }, []);

  // 💾 GUARDAR DATOS AL PULSAR EL BOTÓN
  const guardarDatos = async () => {
    if (texto.trim() !== '') {
      try {
        await addDoc(collection(db, "datos_temporales_prueba"), {
          contenido: texto,
          fecha: new Date()
        });
        setTexto(''); // Limpiar el campo
      } catch (error) {
        console.error("Error al guardar:", error);
      }
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2>Añadir Dato a Firestore (Entorno Next.js Local)</h2>
      
      {/* Campo de texto */}
      <input 
        type="text" 
        value={texto} 
        onChange={(e) => setTexto(e.target.value)} 
        placeholder="Escribe algo aquí..." 
        style={{ padding: '8px', marginRight: '10px' }}
      />
      
      {/* Botón */}
      <button onClick={guardarDatos} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Guardar campo
      </button>

      <h2>Datos leídos de la Base de Datos:</h2>
      <ul>
        {datos.map((dato) => (
          <li key={dato.id}>{dato.contenido}</li>
        ))}
      </ul>
    </div>
  );
}