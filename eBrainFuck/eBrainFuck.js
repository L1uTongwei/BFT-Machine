const fs = require('fs');
var noDeadLoop = false;
var output1 = "", output2 = "";
var help = false;
var sourcefile = "";
for(var i = 1; i < process.argv.length; i++){
    var arg = process.argv[i];
    if(arg == "--no-deadloop"){
        noDeadLoop = true;
    }else if(/--output1=(.*)/.test(arg)){
        output1 = /--output1=(.*)/.exec(arg)[1];
    }else if(/--output2=(.*)/.test(arg)){
        output2 = /--output2=(.*)/.exec(arg)[1];
    }else if(arg == "--help"){
        help = true;
    }else{
        sourcefile = arg;
    }
}
if(help || !output1 || !output2 || !sourcefile){
    console.log(fs.readFileSync('help.txt').toString());
    process.exit(255);
}

var source = fs.readFileSync(sourcefile).toString();
var program = Buffer.alloc(1024);
var programCount = 0, repeatCount = 0;
var repeatOutput = (op, repeat) => {
    for(var j = 1; j <= Math.floor(repeat / 17.0); j++){
        program.writeUInt8(op << 4 | 16, programCount++);
    }
    program.writeUInt8(op << 4 | ((repeat % 17) - 1), programCount++);
};
var writeStackTop = (data) => {
    program.writeUInt8(0b1110 << 4 | (data >> 16), programCount++); // 最高 4 位
    program.writeUInt8(0b1111 << 4 | (data >> 8 & 0xF), programCount++); // 中间 8 位
    program.writeUInt8(0b0001 << 4 | (data & 0xF), programCount++); // 最后 8 位
};

var label = new Array(1024);
var stack = new Array(1024), stackPtr = 0;
label.fill([-1, -1]);
var left_cnt = 0, right_cnt = 0;
for(var i = 0; i < source.length; i++){ // 括号匹配
    // 这里符号 “[” 与符号 “]” 需要 4 条与 5 条指令
    var address_offset = left_cnt * 4 + right_cnt * 5;
    if(source[i] == '['){
        left_cnt++;
        stack[stackPtr++] = i;
    }else if(source[i] == ']'){
        right_cnt++;
        label[i] = label[stack[stackPtr - 1]] = [stack[stackPtr - 1] + address_offset, i + address_offset];
        stackPtr--;
        if(stackPtr < 0){
            console.error("错误：括号不匹配！");
            process.exit(1);
        }
    }
}
if(stackPtr != 0){
    console.error("错误：括号没写完！");
    process.exit(1);
}
for(var i = 0; i < source.length; i++){
    if(source[i] != '[' && source[i] != ']' && (source[i] == source[i + 1])){
        repeatCount++;
        continue;
    }
    repeatCount++;
    switch(source[i]){
        case '+':
            repeatOutput(0b1000, repeatCount);
            break;
        case '-':
            repeatOutput(0b1001, repeatCount);
            break;
        case '<':
            repeatOutput(0b1010, repeatCount);
            break;
        case '>':
            repeatOutput(0b1011, repeatCount);
            break;
        case ',':
            repeatOutput(0b1100, repeatCount);
            break;
        case '.':
            repeatOutput(0b1101, repeatCount);
            break;
        // [ & ] 不可以重复哦~
        case '[': // 等效 while(*ptr){ (需要 4 条指令模拟)
            // 如果当前内存单元为零，则跳转至匹配的符号“]”
            // 1. 设置栈顶
            writeStackTop(label[i][1]);
            // 2. 设置跳转
            program.writeUInt8(0b00110000, programCount++);
            break;
        case ']': // 等效 } (需要 5 条指令模拟)
            //如果当前内存单元不为零，则跳转到匹配的符号“[”
            var right_pos = programCount - 1;
            // 1. 设置栈顶 (地址为条件跳转 - 1)
            writeStackTop(right_pos + 3);
            // 2. 设置跳转 - 如果为零就跳出而不继续
            program.writeUInt8(0b00110000, programCount++);
            // 3. 设置无条件跳转到匹配的符号 “[”
            program.writeUInt8(0b00100000, programCount++);
            break;
    }
    repeatCount = 0;
}
if(!noDeadLoop){ //死循环
    writeStackTop(programCount + 2);
    program.writeUInt8(0b00100000, programCount++);
}

var out1 = fs.openSync(output1, 'w'), out2 = fs.openSync(output2, 'w');
for(var i = 0; i < 512; i++){
    fs.writeSync(out1, Buffer.from([program[i]]));
}
for(var i = 512; i < 1024; i++){
    fs.writeSync(out2, Buffer.from([program[i]]));
}
fs.closeSync(out1);
fs.closeSync(out2);