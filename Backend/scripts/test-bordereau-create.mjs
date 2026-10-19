/**
 * Test script for bordereauService.createBordereau
 * Run from Backend/ directory: node scripts/test-bordereau-create.mjs
 */
import db from '../src/config/db.js';
import * as bordereauModel from '../src/models/bordereauModel.js';
import * as bordereauService from '../src/services/bordereauService.js';

async function main() {
  console.log('Testing bordereau creation...');

  try {
    // Test 1: genererReference
    console.log('\n1. Testing genererReference...');
    const ref = await bordereauModel.genererReference();
    console.log('   Reference:', ref);

    // Test 2: dossiersEligibles
    console.log('\n2. Testing dossiersEligibles for division 1...');
    const eligibles = await bordereauModel.dossiersEligibles(1);
    console.log('   Eligibles:', eligibles.length, 'dossiers');
    console.log('   Is array:', Array.isArray(eligibles));

    // Test 3: createBordereau via service
    console.log('\n3. Testing createBordereau via service...');
    const b = await bordereauService.createBordereau({
      division_id: 1,
      agent_id: 5,
      observation: 'Test from script',
      dossiers: [],
    });
    console.log('   Created:', b.reference, 'ID:', b.id, 'Statut:', b.statut);

    console.log('\n✅ All tests passed!');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

main();