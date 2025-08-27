#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour charger un fichier JSON
const loadJson = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Erreur lors du chargement de ${filePath}:`, error.message);
    return null;
  }
};

// Fonction pour obtenir toutes les clés d'un objet de façon récursive
const getAllKeys = (obj, prefix = '') => {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
};

// Scanner le code pour trouver les clés utilisées
const scanCodeForKeys = (dir) => {
  const usedKeys = new Set();
  
  const scanFile = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Regex pour trouver les clés de traduction
      const patterns = [
        /t[A-Z]\w*\(['"`]([^'"`]+)['"`]\)/g,
        /i18n\.t\(['"`]([^'"`]+)['"`]/g,
        /\{t\(['"`]([^'"`]+)['"`]\)\}/g,
        /t\(['"`]([^'"`]+)['"`]/g
      ];
      
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          usedKeys.add(match[1]);
        }
      });
      
    } catch (error) {
      // Ignore les erreurs de lecture
    }
  };
  
  const scanDirectory = (dirPath) => {
    try {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
          scanFile(fullPath);
        }
      });
    } catch (error) {
      // Ignore les erreurs de lecture
    }
  };
  
  scanDirectory(dir);
  return Array.from(usedKeys);
};

// Fonction principale d'analyse complète
const findMissingTranslations = () => {
  const localesDir = path.join(__dirname, '../src/locales');
  const frDir = path.join(localesDir, 'fr');
  const arDir = path.join(localesDir, 'ar');
  const srcDir = path.join(__dirname, '../src');

  console.log('🔍 Analyse complète des traductions manquantes...\n');

  // Scanner le code pour les clés utilisées
  console.log('📁 Scan du code source...');
  const usedKeys = scanCodeForKeys(srcDir);
  console.log(`✅ ${usedKeys.length} clés trouvées dans le code\n`);

  // Obtenir la liste des fichiers de traduction
  const frFiles = fs.readdirSync(frDir).filter(file => file.endsWith('.json'));
  const arFiles = fs.readdirSync(arDir).filter(file => file.endsWith('.json'));

  let allFrKeys = [];
  let allArKeys = [];
  const allMissingKeys = { fr: [], ar: [] };

  // Collecter toutes les clés des fichiers de traduction
  const commonFiles = frFiles.filter(file => arFiles.includes(file));
  
  commonFiles.forEach(filename => {
    const frPath = path.join(frDir, filename);
    const arPath = path.join(arDir, filename);
    const namespace = filename.replace('.json', '');

    const frData = loadJson(frPath);
    const arData = loadJson(arPath);

    if (frData && arData) {
      const frKeys = getAllKeys(frData);
      const arKeys = getAllKeys(arData);
      
      // Ajouter le namespace aux clés
      const namespacedFrKeys = frKeys.map(key => `${namespace}.${key}`);
      const namespacedArKeys = arKeys.map(key => `${namespace}.${key}`);
      
      allFrKeys = allFrKeys.concat(namespacedFrKeys);
      allArKeys = allArKeys.concat(namespacedArKeys);

      // Trouver les différences entre FR et AR
      const missingInFr = arKeys.filter(key => !frKeys.includes(key));
      const missingInAr = frKeys.filter(key => !arKeys.includes(key));

      missingInFr.forEach(key => {
        allMissingKeys.fr.push({ file: filename, key, namespace: `${namespace}.${key}` });
      });
      
      missingInAr.forEach(key => {
        allMissingKeys.ar.push({ file: filename, key, namespace: `${namespace}.${key}` });
      });
    }
  });

  // Trouver les clés utilisées dans le code mais manquantes dans les traductions
  const missingFromTranslations = {
    fr: [],
    ar: []
  };

  usedKeys.forEach(key => {
    if (!allFrKeys.includes(key)) {
      missingFromTranslations.fr.push(key);
    }
    if (!allArKeys.includes(key)) {
      missingFromTranslations.ar.push(key);
    }
  });

  // Console log des résultats
  console.log('=== CONSOLE LOG DES VARIABLES DE TRADUCTIONS MANQUANTES ===');
  console.log('const missingTranslations = {');
  
  // Traductions manquantes entre FR et AR
  console.log('  // Différences entre langues:');
  console.log('  fr: [');
  allMissingKeys.fr.forEach(item => {
    console.log(`    { file: '${item.file}', key: '${item.key}', fullKey: '${item.namespace}' },`);
  });
  console.log('  ],');
  
  console.log('  ar: [');
  allMissingKeys.ar.forEach(item => {
    console.log(`    { file: '${item.file}', key: '${item.key}', fullKey: '${item.namespace}' },`);
  });
  console.log('  ],');

  // Clés utilisées dans le code mais manquantes dans les traductions
  console.log('  // Clés utilisées dans le code mais manquantes:');
  console.log('  missingFromCode: {');
  console.log('    fr: [');
  missingFromTranslations.fr.forEach(key => {
    console.log(`      '${key}',`);
  });
  console.log('    ],');
  console.log('    ar: [');
  missingFromTranslations.ar.forEach(key => {
    console.log(`      '${key}',`);
  });
  console.log('    ]');
  console.log('  }');
  
  console.log('};');
  console.log('console.log("Variables de traductions manquantes:", missingTranslations);');
  console.log('=== FIN DU CONSOLE LOG ===\n');

  // Résumé
  const totalMissing = allMissingKeys.fr.length + allMissingKeys.ar.length + 
                      missingFromTranslations.fr.length + missingFromTranslations.ar.length;
  
  console.log(`📊 Résumé:`);
  console.log(`  - Clés manquantes FR vs AR: ${allMissingKeys.fr.length}`);
  console.log(`  - Clés manquantes AR vs FR: ${allMissingKeys.ar.length}`);
  console.log(`  - Clés utilisées manquantes en FR: ${missingFromTranslations.fr.length}`);
  console.log(`  - Clés utilisées manquantes en AR: ${missingFromTranslations.ar.length}`);
  console.log(`  - Total des traductions manquantes: ${totalMissing}`);
  
  // Liste détaillée des clés spécifiques mentionnées par l'utilisateur
  console.log('\n🎯 Vérification des clés spécifiques mentionnées:');
  const specificKeys = [
    'batchUpload.fileConstraints',
    'batchUpload.patients',
    'batchUpload.patientsList', 
    'batchUpload.patientsDescription',
    'batchUpload.noPatients',
    'batchUpload.noPatientsDescription',
    'batchUpload.statisticsDescription',
    'batchUpload.statisticsTitle',
    'batchUpload.noData',
    'batchUpload.noDataDescription'
  ];
  
  specificKeys.forEach(key => {
    const inFr = allFrKeys.includes(key);
    const inAr = allArKeys.includes(key);
    const status = inFr && inAr ? '✅' : inFr ? '🔸 AR manquant' : inAr ? '🔸 FR manquant' : '❌ Manquant partout';
    console.log(`  ${key}: ${status}`);
  });
};

// Exécuter l'analyse
findMissingTranslations();