import { LockQueue } from "../src/utils";


describe("lock queue",()=>{
    const lockQueue = new LockQueue();
    it('setimeout to clear lock', (done) => {
        const lockId1 = lockQueue.genId();
        const lockId2 = lockQueue.genId();
        let num = 0;
        setTimeout(async ()=>{
            await lockQueue.wait(lockId1);
            num++;
            expect(num).toBe(1);
        }, 1000);
        setTimeout(async ()=>{
            await lockQueue.wait(lockId2);
            num++;
            expect(num).toBe(2);
            done();
        }, 500);
    });
});

