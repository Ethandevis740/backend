// Node.js Architecture Demonstrations

const EventEmitter = require('events');

console.log('=== Node.js Concepts Demo ===\n');

// 1. Event Loop Demonstration
console.log('1. Event Loop Demo:');
console.log('Start');

setTimeout(() => {
  console.log('Timeout 1 (0ms)');
}, 0);

setTimeout(() => {
  console.log('Timeout 2 (100ms)');
}, 100);

setImmediate(() => {
  console.log('Immediate');
});

process.nextTick(() => {
  console.log('Next Tick');
});

console.log('End');

// 2. Callback Example
console.log('\n2. Callback Demo:');

function fetchUserData(userId, callback) {
  // Simulate async operation
  setTimeout(() => {
    const userData = {
      id: userId,
      name: 'John Doe',
      email: 'john@namal.edu.pk',
      graduationYear: 2020
    };
    callback(null, userData);
  }, 1000);
}

function handleUserData(error, data) {
  if (error) {
    console.error('Error fetching user data:', error);
    return;
  }
  console.log('User data received:', data);
}

fetchUserData(123, handleUserData);

// 3. Custom EventEmitter Usage
console.log('\n3. EventEmitter Demo:');

class AlumniNetwork extends EventEmitter {
  constructor() {
    super();
    this.members = [];
  }

  addMember(member) {
    this.members.push(member);
    this.emit('memberAdded', member);
  }

  removeMember(memberId) {
    const memberIndex = this.members.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      const removedMember = this.members.splice(memberIndex, 1)[0];
      this.emit('memberRemoved', removedMember);
    }
  }

  getMemberCount() {
    return this.members.length;
  }
}

const network = new AlumniNetwork();

// Event listeners
network.on('memberAdded', (member) => {
  console.log(`New member joined: ${member.name} (${member.email})`);
  console.log(`Total members: ${network.getMemberCount()}`);
});

network.on('memberRemoved', (member) => {
  console.log(`Member left: ${member.name}`);
  console.log(`Total members: ${network.getMemberCount()}`);
});

// Add some members
setTimeout(() => {
  network.addMember({
    id: 1,
    name: 'Sarah Ahmed',
    email: 'sarah@namal.edu.pk',
    graduationYear: 2019
  });
}, 2000);

setTimeout(() => {
  network.addMember({
    id: 2,
    name: 'Ali Hassan',
    email: 'ali@namal.edu.pk',
    graduationYear: 2020
  });
}, 3000);

setTimeout(() => {
  network.removeMember(1);
}, 4000);

// 4. File System Operations (Bonus)
const fs = require('fs');
const path = require('path');

console.log('\n4. File System Demo:');

const logFile = path.join(__dirname, 'alumni-log.txt');

function logActivity(activity) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${activity}\n`;
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    } else {
      console.log('Activity logged:', activity);
    }
  });
}

setTimeout(() => {
  logActivity('Alumni network system started');
}, 5000);

setTimeout(() => {
  logActivity('New member registration completed');
}, 6000);

// 5. Stream Example
console.log('\n5. Stream Demo:');

const { Readable } = require('stream');

class AlumniDataStream extends Readable {
  constructor(options) {
    super(options);
    this.currentId = 1;
    this.maxMembers = 5;
  }

  _read() {
    if (this.currentId <= this.maxMembers) {
      const member = {
        id: this.currentId,
        name: `Member ${this.currentId}`,
        email: `member${this.currentId}@namal.edu.pk`,
        graduationYear: 2015 + this.currentId
      };
      this.push(JSON.stringify(member) + '\n');
      this.currentId++;
    } else {
      this.push(null); // End of stream
    }
  }
}

setTimeout(() => {
  console.log('Streaming alumni data:');
  const alumniStream = new AlumniDataStream();
  
  alumniStream.on('data', (chunk) => {
    console.log('Received:', chunk.toString().trim());
  });
  
  alumniStream.on('end', () => {
    console.log('Stream ended');
  });
}, 7000);