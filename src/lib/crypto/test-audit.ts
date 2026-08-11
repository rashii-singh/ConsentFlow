import { hashAction, verifyChain, AuditLogItem } from './audit';

function runAuditChainTest() {
  console.log('🧪 Starting Cryptographic Audit Chain Test...\n');

  // Step 1: Create Genesis Log Entry (GRANT)
  const genesisPayload = {
    userId: 'usr_consumer_01',
    noticeId: 'notice_01',
    businessId: 'biz_healthplus',
    action: 'GRANT',
    choices: { medical_diagnosis: true, prescription_sharing: true },
    timestamp: '2026-08-11T10:00:00Z',
  };

  const genesisResult = hashAction(genesisPayload, null);

  const genesisLog: AuditLogItem = {
    id: 'log_01',
    recordId: 'rec_01',
    action: 'GRANT',
    actorId: 'usr_consumer_01',
    previousHash: null,
    currentHash: genesisResult.currentHash,
    payload: genesisPayload,
    timestamp: '2026-08-11T10:00:00Z',
  };

  console.log('✅ Created Genesis Audit Log (Index 0):');
  console.log(`   Prev Hash: null`);
  console.log(`   Curr Hash: ${genesisLog.currentHash}`);

  // Step 2: Append Second Record (REVOKE) linked to Genesis currentHash
  const secondPayload = {
    userId: 'usr_consumer_01',
    noticeId: 'notice_01',
    businessId: 'biz_healthplus',
    action: 'REVOKE',
    choices: { medical_diagnosis: true, prescription_sharing: false },
    timestamp: '2026-08-11T12:00:00Z',
  };

  const secondResult = hashAction(secondPayload, genesisLog.currentHash);

  const secondLog: AuditLogItem = {
    id: 'log_02',
    recordId: 'rec_01',
    action: 'REVOKE',
    actorId: 'usr_consumer_01',
    previousHash: genesisLog.currentHash,
    currentHash: secondResult.currentHash,
    payload: secondPayload,
    timestamp: '2026-08-11T12:00:00Z',
  };

  console.log('\n✅ Created Second Audit Log (Index 1):');
  console.log(`   Prev Hash: ${secondLog.previousHash}`);
  console.log(`   Curr Hash: ${secondLog.currentHash}`);

  // Step 3: Append Third Record (ACCESS)
  const thirdPayload = {
    userId: 'usr_consumer_01',
    noticeId: 'notice_01',
    businessId: 'biz_healthplus',
    action: 'ACCESS',
    choices: { requestedBy: 'Data Protection Board' },
    timestamp: '2026-08-11T14:00:00Z',
  };

  const thirdResult = hashAction(thirdPayload, secondLog.currentHash);

  const thirdLog: AuditLogItem = {
    id: 'log_03',
    recordId: 'rec_01',
    action: 'ACCESS',
    actorId: 'usr_regulator_01',
    previousHash: secondLog.currentHash,
    currentHash: thirdResult.currentHash,
    payload: thirdPayload,
    timestamp: '2026-08-11T14:00:00Z',
  };

  const originalChain: AuditLogItem[] = [genesisLog, secondLog, thirdLog];

  // Step 4: Verify Valid Audit Chain
  console.log('\n🔍 Verifying Untampered Audit Chain (3 Records)...');
  const validCheck = verifyChain(originalChain);
  console.log(`   Result Status: ${validCheck.status}`);
  console.log(`   Valid: ${validCheck.valid}`);
  console.log(`   Broken Index: ${validCheck.brokenIndex}`);

  if (!validCheck.valid || validCheck.status !== 'VALID') {
    console.error('❌ FAILURE: Untampered chain verification failed!');
    process.exit(1);
  }

  // Step 5: Test Tampering on Second Log (Corrupt Payload / Hash)
  console.log('\n🚨 Simulating Tampering on Record 1 (Index 1)...');
  const tamperedChain: AuditLogItem[] = JSON.parse(JSON.stringify(originalChain));

  // Alter payload at index 1 without updating currentHash
  tamperedChain[1].payload.choices.prescription_sharing = true;

  const tamperedCheck = verifyChain(tamperedChain);
  console.log(`   Result Status: ${tamperedCheck.status}`);
  console.log(`   Valid: ${tamperedCheck.valid}`);
  console.log(`   Broken Index: ${tamperedCheck.brokenIndex}`);
  console.log(`   Error Message: ${tamperedCheck.error}`);

  if (tamperedCheck.valid || tamperedCheck.status !== 'TAMPERED' || tamperedCheck.brokenIndex !== 1) {
    console.error('❌ FAILURE: Tampering was not correctly detected at brokenIndex 1!');
    process.exit(1);
  }

  console.log('\n🎉 ALL CRYPTOGRAPHIC AUDIT CHAIN TESTS PASSED SUCCESSFULY!');
}

runAuditChainTest();
