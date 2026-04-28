/**
 * Analisi file: swagger.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: import swaggerAutogen from 'swagger-autogen';
import swaggerAutogen from 'swagger-autogen';

// Esegue: const doc = {
const doc = {
    // Esegue: info: {
    info: {
      // Esegue: title: 'Fast Food API - Rimoldi Diego',
      title: 'Fast Food API - Rimoldi Diego',
      // Esegue: description: 'Documentazione endpoint API REST, per il progetto "Fast-Food" del corso di Programm...
      description: 'Documentazione endpoint API REST, per il progetto "Fast-Food" del corso di Programmazione Web e Mobile - A.A. 2025/2026'
    // Esegue: },
    },
    // Esegue: host: 'localhost:3000'
    host: 'localhost:3000'
  // Esegue: };
  };

// Esegue: const outputFile = './swagger.json';
const outputFile = './swagger.json';
// Esegue: const inputFiles = ['./index.js'];
const inputFiles = ['./index.js'];

// Esegue: swaggerAutogen(outputFile,inputFiles, doc);
swaggerAutogen(outputFile,inputFiles, doc);
