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

// Fonction pour comparer deux ensembles de clés
const compareKeys = (keys1, keys2, label1, label2) => {
  const missing1 = keys2.filter(key => !keys1.includes(key));
  const missing2 = keys1.filter(key => !keys2.includes(key));

  if (missing1.length > 0) {
    console.log(`\n❌ Clés manquantes dans ${label1}:`);
    missing1.forEach(key => console.log(`  - ${key}`));
  }

  if (missing2.length > 0) {
    console.log(`\n❌ Clés manquantes dans ${label2}:`);
    missing2.forEach(key => console.log(`  - ${key}`));
  }

  if (missing1.length === 0 && missing2.length === 0) {
    console.log(`\n✅ ${label1} and ${label2} are synchronized`);
  }

  return { missing1, missing2 };
};

// Console log spécialisé pour les variables manquantes
const logMissingTranslations = (allMissingKeys) => {
  console.log('\n=== CONSOLE LOG DES VARIABLES DE TRADUCTIONS MANQUANTES ===');
  console.log('const missingTranslations = {');
  
  Object.keys(allMissingKeys).forEach(language => {
    if (allMissingKeys[language].length > 0) {
      console.log(`  ${language}: [`);
      allMissingKeys[language].forEach(item => {
        console.log(`    { file: '${item.file}', key: '${item.key}' },`);
      });
      console.log('  ],');
    }
  });
  
  console.log('};');
  console.log('console.log("Variables de traductions manquantes:", missingTranslations);');
  console.log('=== FIN DU CONSOLE LOG ===\n');
};

// Fonction principale
const checkTranslations = () => {
  const localesDir = path.join(__dirname, '../src/locales');
  const frDir = path.join(localesDir, 'fr');
  const arDir = path.join(localesDir, 'ar');

  console.log('🔍 Vérification des traductions...\n');

  // Obtenir la liste des fichiers de traduction
  const frFiles = fs.readdirSync(frDir).filter(file => file.endsWith('.json'));
  const arFiles = fs.readdirSync(arDir).filter(file => file.endsWith('.json'));

  // Vérifier que tous les fichiers existent dans les deux langues
  const missingInAr = frFiles.filter(file => !arFiles.includes(file));
  const missingInFr = arFiles.filter(file => !frFiles.includes(file));

  if (missingInAr.length > 0) {
    console.log('❌ Fichiers manquants dans ar/:');
    missingInAr.forEach(file => console.log(`  - ${file}`));
  }

  if (missingInFr.length > 0) {
    console.log('❌ Fichiers manquants dans fr/:');
    missingInFr.forEach(file => console.log(`  - ${file}`));
  }

  // Comparer les clés dans chaque fichier
  const commonFiles = frFiles.filter(file => arFiles.includes(file));
  let totalMissing = 0;
  const allMissingKeys = { fr: [], ar: [] };

  commonFiles.forEach(filename => {
    console.log(`\n📄 Vérification de ${filename}:`);
    
    const frPath = path.join(frDir, filename);
    const arPath = path.join(arDir, filename);

    const frData = loadJson(frPath);
    const arData = loadJson(arPath);

    if (!frData || !arData) {
      console.log(`  ❌ Impossible de charger les fichiers`);
      return;
    }

    const frKeys = getAllKeys(frData);
    const arKeys = getAllKeys(arData);

    const { missing1, missing2 } = compareKeys(
      frKeys,
      arKeys,
      `fr/${filename}`,
      `ar/${filename}`
    );

    // Ajouter les clés manquantes à la collection globale
    missing1.forEach(key => {
      allMissingKeys.fr.push({ file: filename, key });
    });
    
    missing2.forEach(key => {
      allMissingKeys.ar.push({ file: filename, key });
    });

    totalMissing += missing1.length + missing2.length;
  });

  // Générer le console log des variables manquantes
  logMissingTranslations(allMissingKeys);

  console.log(`\n📊 Résumé:`);
  console.log(`  - Fichiers français: ${frFiles.length}`);
  console.log(`  - Fichiers arabes: ${arFiles.length}`);
  console.log(`  - Fichiers communs: ${commonFiles.length}`);
  console.log(`  - Clés manquantes au total: ${totalMissing}`);

  if (totalMissing === 0 && missingInAr.length === 0 && missingInFr.length === 0) {
    console.log('\n🎉 Toutes les traductions sont synchronisées !');
  } else {
    console.log('\n⚠️  Des traductions sont manquantes ou désynchronisées.');
    process.exit(1);
  }
};

// Exécuter la vérification
checkTranslations();
