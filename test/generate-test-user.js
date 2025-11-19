/**
 * Script para generar hash de contraseñas de prueba
 * 
 * Uso:
 *   node test/generate-test-user.js
 */

const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = process.argv[2] || 'admin123';
    const saltRounds = 10;

    console.log('Generando hash para contraseña de prueba...');
    console.log('Contraseña:', password);
    console.log('');

    const hash = await bcrypt.hash(password, saltRounds);

    console.log('Hash generado:');
    console.log(hash);
    console.log('');
    console.log('Copia este hash en el archivo seed-test-data.sql');
    console.log('');
    console.log('SQL de ejemplo:');
    console.log(`INSERT INTO users (email, password, id_role) VALUES`);
    console.log(`('admin@cq.com', '${hash}', 1);`);
}

generateHash().catch(console.error);
