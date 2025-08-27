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

// Vérifier une clé spécifique dans un objet
const hasKey = (obj, keyPath) => {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  return true;
};

// Fonction principale
const checkSpecificTranslations = () => {
  const localesDir = path.join(__dirname, '../src/locales');
  const frDir = path.join(localesDir, 'fr');
  const arDir = path.join(localesDir, 'ar');

  console.log('🔍 Vérification détaillée des traductions spécifiques...\n');

  // Clés spécifiques mentionnées par l'utilisateur
  const keyFiles = {
    'batchUpload': [
      'fileConstraints',
      'patients',
      'patientsList', 
      'patientsDescription',
      'noPatients',
      'noPatientsDescription',
      'statisticsDescription',
      'statisticsTitle',
      'noData',
      'noDataDescription'
    ],
    'common': [
      'batchUpload.statistics.title'
    ]
  };

  const textSearches = [
    'Gérez toutes vos analyses de laboratoire',
    'Commencez par créer votre première analyse.',
    'Aucune analyse trouvée'
  ];

  const allMissingTranslations = [];

  // Vérifier chaque fichier
  Object.keys(keyFiles).forEach(fileName => {
    console.log(`📄 Vérification de ${fileName}.json:`);
    
    const frPath = path.join(frDir, `${fileName}.json`);
    const arPath = path.join(arDir, `${fileName}.json`);

    const frData = loadJson(frPath);
    const arData = loadJson(arPath);

    if (!frData || !arData) {
      console.log(`❌ Impossible de charger les fichiers`);
      return;
    }

    keyFiles[fileName].forEach(key => {
      const frHas = hasKey(frData, key);
      const arHas = hasKey(arData, key);
      
      let status = '';
      if (frHas && arHas) {
        status = '✅ Présent dans les deux';
      } else if (frHas && !arHas) {
        status = '🔸 Manquant en ARABE';
        allMissingTranslations.push({
          file: fileName,
          key: key,
          language: 'ar',
          fullKey: `${fileName}.${key}`
        });
      } else if (!frHas && arHas) {
        status = '🔸 Manquant en FRANÇAIS';
        allMissingTranslations.push({
          file: fileName,
          key: key,
          language: 'fr',
          fullKey: `${fileName}.${key}`
        });
      } else {
        status = '❌ Manquant partout';
        allMissingTranslations.push({
          file: fileName,
          key: key,
          language: 'both',
          fullKey: `${fileName}.${key}`
        });
      }
      
      console.log(`  ${key}: ${status}`);
    });
    
    console.log('');
  });

  // Chercher les textes spécifiques dans tous les fichiers
  console.log('🔍 Recherche de textes spécifiques:');
  const allFiles = ['common', 'dashboard', 'analysis', 'batchUpload', 'patientHistory'];
  
  textSearches.forEach(searchText => {
    console.log(`\n📝 Recherche: "${searchText}"`);
    let foundInFr = false;
    let foundInAr = false;
    let frLocation = '';
    let arLocation = '';
    
    allFiles.forEach(fileName => {
      const frPath = path.join(frDir, `${fileName}.json`);
      const arPath = path.join(arDir, `${fileName}.json`);
      
      try {
        const frContent = fs.readFileSync(frPath, 'utf8');
        const arContent = fs.readFileSync(arPath, 'utf8');
        
        if (frContent.includes(searchText)) {
          foundInFr = true;
          frLocation = fileName;
        }
        
        // Pour l'arabe, on cherche une traduction approximative
        const arabicEquivalents = {
          'Gérez toutes vos analyses de laboratoire': 'إدارة جميع التحاليل',
          'Commencez par créer votre première analyse.': 'ابدأ بإنشاء تحليلك الأول',
          'Aucune analyse trouvée': 'لم يتم العثور على تحاليل'
        };
        
        if (arabicEquivalents[searchText] && arContent.includes(arabicEquivalents[searchText])) {
          foundInAr = true;
          arLocation = fileName;
        }
      } catch (error) {
        // Fichier non trouvé, ignorer
      }
    });
    
    let status = '';
    if (foundInFr && foundInAr) {
      status = `✅ Trouvé dans FR:${frLocation} et AR:${arLocation}`;
    } else if (foundInFr && !foundInAr) {
      status = `🔸 Trouvé en FR:${frLocation} mais manquant en ARABE`;
      allMissingTranslations.push({
        file: 'unknown',
        key: `text: "${searchText}"`,
        language: 'ar',
        fullKey: searchText
      });
    } else if (!foundInFr && foundInAr) {
      status = `🔸 Trouvé en AR:${arLocation} mais manquant en FRANÇAIS`;
      allMissingTranslations.push({
        file: 'unknown',
        key: `text: "${searchText}"`,
        language: 'fr',
        fullKey: searchText
      });
    } else {
      status = '❌ Non trouvé';
      allMissingTranslations.push({
        file: 'unknown',
        key: `text: "${searchText}"`,
        language: 'both',
        fullKey: searchText
      });
    }
    
    console.log(`  ${status}`);
  });

  // Console log final
  console.log('\n=== CONSOLE LOG DES VARIABLES DE TRADUCTIONS MANQUANTES ===');
  console.log('const missingTranslations = {');
  
  const frMissing = allMissingTranslations.filter(t => t.language === 'fr' || t.language === 'both');
  const arMissing = allMissingTranslations.filter(t => t.language === 'ar' || t.language === 'both');
  
  console.log('  fr: [');
  frMissing.forEach(item => {
    console.log(`    { file: '${item.file}', key: '${item.key}', fullKey: '${item.fullKey}' },`);
  });
  console.log('  ],');
  
  console.log('  ar: [');
  arMissing.forEach(item => {
    console.log(`    { file: '${item.file}', key: '${item.key}', fullKey: '${item.fullKey}' },`);
  });
  console.log('  ],');
  
  console.log('};');
  console.log('console.log("Variables de traductions manquantes:", missingTranslations);');
  console.log('=== FIN DU CONSOLE LOG ===\n');

  console.log(`📊 Total des traductions manquantes: ${allMissingTranslations.length}`);
  console.log(`  - Manquantes en français: ${frMissing.length}`);
  console.log(`  - Manquantes en arabe: ${arMissing.length}`);
};

// Exécuter la vérification
checkSpecificTranslations();