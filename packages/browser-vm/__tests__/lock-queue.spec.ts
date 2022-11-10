import { LockQueue } from "../src/utils";


describe("lock queue",()=>{
    const lockQueue = new LockQueue();
    it('setimeout to clear lock', (done) => {
        const lockId1 = lockQueue.genId();
        const lockId2 = lockQueue.genId();
        setTimeout(async ()=>{
            await lockQueue.wait(lockId1);
            expect(1).toBe(1);
            lockQueue.release();
        }, 1000);
        setTimeout(async ()=>{
            await lockQueue.wait(lockId2);
            lockQueue.release();
            done();
        }, 500);
    });
});

