#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010/api';

console.log(`🔍 Test de connectivité CORS vers: ${API_BASE_URL}`);

const testEndpoints = [
  { method: 'GET', endpoint: '/health', description: 'Health check' },
  { method: 'OPTIONS', endpoint: '/auth/login', description: 'Preflight login' },
  { method: 'GET', endpoint: '/auth/me', description: 'Auth check' }
];

async function testCORS() {
  console.log('=' .repeat(60));
  
  for (const test of testEndpoints) {
    try {
      console.log(`\n📋 Test: ${test.description}`);
      console.log(`   ${test.method} ${API_BASE_URL}${test.endpoint}`);
      
      const config = {
        method: test.method.toLowerCase(),
        url: `${API_BASE_URL}${test.endpoint}`,
        timeout: 5000,
        validateStatus: () => true, // Accept all status codes
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type,authorization'
        }
      };
      
      const response = await axios(config);
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📡 CORS Headers:`);
      
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods', 
        'access-control-allow-headers',
        'access-control-allow-credentials'
      ];
      
      corsHeaders.forEach(header => {
        const value = response.headers[header];
        if (value) {
          console.log(`      ${header}: ${value}`);
        }
      });
      
      if (response.status < 500) {
        console.log(`   ✅ Réponse reçue avec succès`);
      } else {
        console.log(`   ⚠️  Erreur serveur: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 Le serveur backend n'est probablement pas démarré`);
      }
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 Résumé des tests terminés');
  console.log('\n💡 Actions recommandées:');
  console.log('1. Vérifiez que le backend tourne sur le port 3010');
  console.log('2. Vérifiez que le frontend tourne sur le port 3000');
  console.log('3. Redémarrez les deux serveurs après les modifications CORS');
}

// Exécuter les tests
testCORS();