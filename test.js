import test from 'tape'
import ipm from './src/ipm.js'

test('add', async tape => {
  tape.plan(1);
  await test('add program from npm', async tape => {
    tape.plan(1);
    await ipm('leofcoin-core', {add: true});
    tape.ok(true);
  });

  await test('add program searching github', async tape => {
    tape.plan(1)
    await ipm('leofcoin-core', {add: true})
    tape.ok(true)
  })

  await test('add program from github using branch/release', async tape => {
    tape.plan(1);
    await ipm('leofcoin-core@namesys-pubsub', { add: true })
    tape.ok(1)
  })

  await test('add program from url', async tape => {
    tape.plan(1);
    await ipm('https://github.com/leofcoin/leofcoin-core', {add: true});
    tape.ok(true);
  });

  await test('add program from github url', async tape => {
    tape.plan(1);
    await ipm('https://github.com/leofcoin/leofcoin-core', {add: true});
    tape.ok(true);
  })

  await test('wheris program', async tape => {
    tape.plan(1);
    await ipm('leofcoin-core', {whereis: true});
    tape.ok(true);
  })

  await test('get program version', async tape => {
    tape.plan(1);
    await ipm('leofcoin-core', {version: true});
    tape.ok(true);
  })

  await test('uninstall program', async tape => {
    tape.plan(1);
    await ipm('leofcoin-core', {uninstall: true});
    tape.ok(true);
  })

  await test('uninstall program using branch/release/version', async tape => {
    tape.plan(1);
    await ipm('leofcoin-core@namesys-pubsub', { uninstall: true })
    tape.ok(1)
  })
  tape.ok(true);
})
