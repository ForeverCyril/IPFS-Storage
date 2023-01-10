// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library FileList {
    struct File {
        uint256 id;
        string cid;
        string name;
        string path;
        uint256 size;
        string fType;
        string desc;
        string key;
    }

    struct List {
        File[] list;
        mapping(uint256 => uint) id2Idx; // value is real idx + 1
        uint256 nextId;
    }

    function add(List storage self, File memory file) public returns (uint256 id){
        id = self.nextId++;
        file.id = id;
        self.id2Idx[id] = self.list.length + 1;
        self.list.push(file);
    }

    function remove(List storage self, uint id) public {
        require(exist(self, id), "Target Not Exsit");
        // get index of target
        uint idx = self.id2Idx[id] - 1;
        // remove from index mapping
        self.id2Idx[id] = 0;
        if (idx != self.list.length - 1) {// swap with last element if it is not at lasts
            uint last = self.list.length - 1;
            self.list[idx] = self.list[last];
            self.id2Idx[self.list[last].id] = idx;
        }
        self.list.pop();
    }

    function get(List storage self, uint256 id) public view returns (File memory){
        require(exist(self, id), "Target Not Exsit");
        return self.list[self.id2Idx[id] - 1];
    }

    function update(List storage self, File memory file) public {
        require(exist(self, file.id), "Target Not Exsit");
        self.list[self.id2Idx[file.id] - 1] = file;
    }

    function size(List storage self) public view returns (uint){
        return self.list.length;
    }

    function exist(List storage self, uint256 id) public view returns (bool){
        return self.id2Idx[id] != 0;
    }
}

contract Storage {
    using FileList for FileList.List;

    mapping(address => FileList.List) fileListOfUser;

    function getFilesCount() public view returns (uint) {
        return fileListOfUser[msg.sender].size();
    }

    function getFile(uint256 id) public view returns (FileList.File memory){
        require(fileListOfUser[msg.sender].exist(id), unicode"文件不存在");
        return fileListOfUser[msg.sender].get(id);
    }

    function getAllFile() public view returns (FileList.File[] memory){
        return fileListOfUser[msg.sender].list;
    }

    function addFile(
        string memory cid,
        string memory name,
        string memory path,
        uint256 size,
        string memory fType,
        string memory desc,
        string memory key
    ) public returns (uint256){
        require(bytes(cid).length > 0, "Param (cid) Error!");
        require(bytes(key).length > 0, "Param (key) Error!");
        require(bytes(name).length > 0, "Param (name) Error!");
        require(bytes(path).length > 0, "Param (path) Error!");
        require(bytes(fType).length > 0, "Param (fTyoe) Error!");
        require(size > 0, "Param (size) Error!");
        if(bytes(fType).length == 0){
            fType = "File";
        }
        FileList.File memory file = FileList.File(
            0,
            cid,
            name,
            path,
            size,
            fType,
            desc,
            key
        );
        return fileListOfUser[msg.sender].add(file);
    }

    function removeFile(uint256 id) public {
        require(fileListOfUser[msg.sender].exist(id), unicode"文件不存在");
        fileListOfUser[msg.sender].remove(id);
    }
}