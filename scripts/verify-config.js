#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Vérification de la configuration des ports...\n');

// Vérifier package.json frontend
try {
  const frontendPackage = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../package.json'), 
    'utf8'
  ));
  
  const proxyUrl = frontendPackage.proxy;
  console.log(`📦 Frontend package.json:`);
  console.log(`   Proxy: ${proxyUrl}`);
  
  if (proxyUrl === 'http://localhost:3010') {
    console.log(`   ✅ Proxy correctement configuré vers le backend`);
  } else {
    console.log(`   ❌ Proxy mal configuré (devrait être http://localhost:3010)`);
  }
} catch (error) {
  console.log(`❌ Erreur lecture frontend package.json: ${error.message}`);
}

// Vérifier .env frontend
try {
  const frontendEnv = fs.readFileSync(
    path.join(__dirname, '../.env'), 
    'utf8'
  );
  
  console.log(`\n🌍 Frontend .env:`);
  const apiUrlMatch = frontendEnv.match(/REACT_APP_API_URL=(.+)/);
  if (apiUrlMatch) {
    const apiUrl = apiUrlMatch[1];
    console.log(`   API URL: ${apiUrl}`);
    
    if (apiUrl === 'http://localhost:3010/api') {
      console.log(`   ✅ API URL correctement configurée`);
    } else {
      console.log(`   ❌ API URL mal configurée (devrait être http://localhost:3010/api)`);
    }
  } else {
    console.log(`   ❌ REACT_APP_API_URL non trouvée dans .env`);
  }
} catch (error) {
  console.log(`❌ Erreur lecture frontend .env: ${error.message}`);
}

// Vérifier .env backend
try {
  const backendEnv = fs.readFileSync(
    path.join(__dirname, '../../backend/.env'), 
    'utf8'
  );
  
  console.log(`\n🎯 Backend .env:`);
  const portMatch = backendEnv.match(/PORT=(\d+)/);
  const frontendUrlMatch = backendEnv.match(/FRONTEND_URL=(.+)/);
  
  if (portMatch) {
    const port = portMatch[1];
    console.log(`   Port: ${port}`);
    
    if (port === '3010') {
      console.log(`   ✅ Port backend correctement configuré`);
    } else {
      console.log(`   ⚠️  Port backend différent de 3010`);
    }
  }
  
  if (frontendUrlMatch) {
    const frontendUrl = frontendUrlMatch[1];
    console.log(`   Frontend URL: ${frontendUrl}`);
    
    if (frontendUrl === 'http://localhost:3000') {
      console.log(`   ✅ Frontend URL correctement configurée`);
    } else {
      console.log(`   ⚠️  Frontend URL différente de http://localhost:3000`);
    }
  }
} catch (error) {
  console.log(`❌ Erreur lecture backend .env: ${error.message}`);
}

console.log(`\n📋 Configuration recommandée:`);
console.log(`   Frontend (port 3000): http://localhost:3000`);
console.log(`   Backend (port 3010): http://localhost:3010`);
console.log(`   API Base URL: http://localhost:3010/api`);

console.log(`\n🚀 Pour appliquer les changements:`);
console.log(`   1. Redémarrez le serveur frontend (npm start)`);
console.log(`   2. Redémarrez le serveur backend (npm run dev)`);
console.log(`   3. L'erreur de proxy devrait disparaître`);

console.log(`\n` + '='.repeat(60));