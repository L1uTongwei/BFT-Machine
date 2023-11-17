const fs = require('fs');
var help = false, noCode = false;
var sourcefile = "", mode = "";
for(var i = 1; i < process.argv.length; i++){
    var arg = process.argv[i];
    if(/--mode=(.*)/.test(arg)){
        mode = /--mode=(.*)/.exec(arg)[1];
    }else if(arg == "--help"){
        help = true;
    }else if(arg == "--no-code"){
        noCode = true;
    }else{
        sourcefile = arg;
    }
}
if(help || !sourcefile || (mode != "asm" && mode != "bf")){
    console.log(fs.readFileSync('help.txt').toString());
    process.exit(255);
}

var program = fs.readFileSync(sourcefile);
var repeat_count = 0, end_position = 0;
for(var i = program.length - 1; i >= 0; i--){
    end_position = i;
    if(program[i]) break;
}
console.log("mov ebp, 0 ; Address Pointer");
console.log("mov eax, 0 ; Stack Top Register");
console.log("mov ebx, 0 ; Stack Address Pointer");
for(var i = 0; i <= end_position; i++){
    var output = "*" + program[i].toString(2).padStart(8, "0") + "* ";
    if(noCode) output = "";
    var op = program[i] >> 4, repeat = program[i] & 0b1111;
    if(op == (program[i + 1] >> 4)){
        repeat_count += repeat + 1;
        console.log(output + "(repeated)");
        continue;
    }
    repeat_count += repeat + 1;
    switch(op){
        case 0b1000:
            console.log(output + "add byte [ebp], " + repeat_count.toString());
            break;
        case 0b1001:
            console.log(output + "sub byte [ebp], " + repeat_count.toString());
            break;
        case 0b1010:
            console.log(output + "add word ebp, " + repeat_count.toString());
            break;
        case 0b1011:
            console.log(output + "; (in) repeat " + repeat_count.toString());
            break;
        case 0b1000:
            console.log(output + "; (out) repeat " + repeat_count.toString());
            break;
        case 0b1110:
            console.log(output + "and eax, 0xFF");
            console.log("           add eax, " + (repeat << 16).toString());
            console.log("           mov word [ebx], eax ; Set Jump Address 16~19");
            break;
        case 0b1111:
            if((program[i + 1] >> 4) == 0b0001){
                break;
            }
            console.log(output + "mov ah, byte [ebp]");
            console.log("           mov word [ebx], eax ; Set Jump Address 8~15");
            break;
        case 0b0001:
            if((program[i - 1] >> 4) == 0b1111){
                console.log(output + "mov ax, word [ebp] ; Set Jump Address 0~15");
                console.log("           mov word [ebx], eax ; Set Jump Address 0~15");
                break;
            }
            console.log(output + "mov al, byte [ebp]");
            console.log("           mov word [ebx], eax ; Set Jump Address 0~7");
            break;
        case 0b0010:
            console.log(output + "jmp eax + 1");
            break;
        case 0b0011:
            console.log(output + "jz eax + 1");
            break;
        case 0b0100:
            console.log(output + "inc eax");
            break;
        case 0b0101:
            console.log(output + "dec eax");
            break;
    }
    repeat_count = 0;
}