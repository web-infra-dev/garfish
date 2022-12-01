import { LockQueue } from "../src/utils";


describe("lock queue",()=>{
    const lockQueue = new LockQueue();
    it('setimeout to clear lock', (done) => {
        const lockId1 = lockQueue.genId();
        const lockId2 = lockQueue.genId();
        const lockId3 = lockQueue.genId();
        let num = 0;
        setTimeout(async ()=>{
            await lockQueue.wait(lockId1);
            num++;
            expect(num).toBe(2);
        }, 1000);
        setTimeout(()=>{
            lockQueue.release(lockId2);
            num++;
            expect(num).toBe(1);
        }, 700);
        setTimeout(async ()=>{
            await lockQueue.wait(lockId3);
            num++;
            expect(num).toBe(3);
            done();
        }, 500);
    });
});

