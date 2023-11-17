# eBrainFuck 开发文档

### 简介

eBrainFuck 是编译器的名字。

### 编译器介绍

编译器是基于 Node.js 编写的。

一般来说，为了避免进入错误流程，编译器会在最后加入死循环。使用命令行 `--no-deadloop` 关闭。

- 符号“+” 表示当前内存单元 ++
- 符号“-” 表示当前内存单元 --
- 符号“<” 表示当前内存指针 --
- 符号“>” 表示当前内存指针 ++
- 符号“[” 表示如果当前内存单元为零，则跳转至匹配的符号“]”
- 符号“]” 表示如果当前内存单元不为零，则跳转到匹配的符号“[”
- 符号“,” 表示输入当前内存单元
- 符号“.” 表示输出当前内存单元

其中，“[” 与 “]” 必须一个在前，一个在后。

Helloworld:

```
++++++++++[>+++++++>++++++++++>+++<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.
```

由于其晦涩难懂，所以并不常用。

当然，由于不是硬件完全采用的机器语言，需要产生或许更多的代码来模拟。

”[“ 与 ”]“ 为伪操作，这样的操作会生成多条指令。

### 输出格式

输出文件是两个，因此需要命令行选项。

`--output1=1.bin` 程序前 512 字节。

`--output2=2.bin` 程序后 512 字节。

这两个文件应当烧写到对应的 ROM 中。