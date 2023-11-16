const fs = require('fs');
var pureBrainfuck = false, noDeadLoop = false;
var output1 = "", output2 = "";
var help = false;
var sourcefile = "";
for(var arg in process.argv){
    if(arg == "--mode=pureBF"){
        pureBrainfuck = true;
    }else if(arg == "--no-deadloop"){
        noDeadLoop = true;
    }else if(/--output1=(.*)/.test(arg)){
        output1 = /--output1=(.*)/.exec(arg)[1];
    }else if(/--output2=(.*)/.test(arg)){
        output2 = /--output2=(.*)/.exec(arg)[1];
    }else if(arg == "help"){
        help = true;
    }else{
        sourcefile = arg;
    }
}
if(help || !output1 || !output2 || !source){
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
    program.writeUInt8(op << 4 | (repeat % 17 - 1), programCount++);
};
if(pureBrainfuck){
    for(var i = 0; i < source.length; i++){
        if(repeatCount == 0 || source[i] == source[i - 1]){
            repeatCount++;
            continue;
        }
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
            case '[': // 等效 while(*ptr){
                
                break;
            case ']': // 等效 }
                break;
        }
    }
}else{

}