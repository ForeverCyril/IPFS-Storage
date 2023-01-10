const {expect} = require("chai")

describe("Storage", function(){
    let owner;
    let otherAccount;
    let storage;

    before(async function(){
        [owner, ...otherAccount] = await ethers.getSigners();
        const libFileListFactory = await ethers.getContractFactory("FileList");
        const libFileList = await libFileListFactory.deploy();
        const storageFactory = await ethers.getContractFactory("Storage", {
            libraries:{
                FileList: libFileList.address,
            }
        });
        storage = await storageFactory.deploy();
    });

    describe("File Operation", function(){
        it("Should add file with no error", async function(){
            await storage.addFile(
                "QmFakeIpfsCidForTest",
                "test-file.txt",
                "/",
                114514,
                "file",
                "A file to test",
                "fake key"
            )

            await storage.addFile(
                "QmFakeIpfsCidForTest2",
                "test-file2.txt",
                "/",
                114514,
                "file",
                "A file to test 2",
                "fake key"
            )
        })

        it("Should get error when missing param (empty string)", async function(){
            
            await expect(storage.addFile(
                "",
                "test-file.txt",
                "/",
                114514,
                "file",
                "A file to test",
                "fake key"
            )).to.be.revertedWith("Param Error!");
        });

        it("Should get files", async function(){
            const fileList = await storage.getAllFile();
            expect(fileList.length, "file count").eq(2);
            expect(fileList[0].cid, "1st file cid").eq("QmFakeIpfsCidForTest");
            expect(fileList[1].cid, "2nd file cid").eq("QmFakeIpfsCidForTest2");

            const file = await storage.getFile(fileList[1].id);
            expect(file.cid, "info by getFile").eq(fileList[1].cid);
            
            const count = await storage.getFilesCount();
            expect(count, "info by getFilesCount").eq(2);
        });

        it("Should remove file (not last element)", async function(){
            const fileList = await storage.getAllFile();
            //remove 1st file
            await storage.removeFile(fileList[0].id);
            
            const fileListAfter = await storage.getAllFile();
            expect(fileListAfter.length, "file count").eq(1);
            expect(fileListAfter[0].cid, "1st(2nd before) file cid").eq("QmFakeIpfsCidForTest2");
        });

        it("Should remove file (last element)", async function(){
            
            const fileList = await storage.getAllFile();
            await storage.addFile(
                "QmFakeIpfsCidForTest3",
                "test-file3.txt",
                "/",
                114514,
                "file",
                "A file to test 2",
                "fake key"
            );
            const fileListAfter = await storage.getAllFile();
            expect(fileListAfter.length, "file count").eq(2);
            expect(fileListAfter[0].cid, "1st file cid").eq(fileList[0].cid);
            expect(fileListAfter[1].cid, "2nd file cid").eq("QmFakeIpfsCidForTest3");
            await storage.removeFile(fileListAfter[1].id);
            const fileListAfter2 = await storage.getAllFile();
            expect(fileListAfter2.length, "file count").eq(1);
            expect(fileListAfter2[0].cid, "1st file").eq(fileListAfter[0].cid);
        });
    });
})