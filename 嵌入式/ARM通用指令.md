
## ARM指令系统(通用指令)
	
### ARM指令

1. ARM汇编指令(ARM公司定)

- 一条汇编指令唯一对应一条机器指令
```asm
MOV R0, #5  => 010101...
```

```
		操作码: 表示是何种操作  "指令助词符"
				MOV 表示 移动 
				ADD 表示 加法                                     
				....
		操作数:
				结果操作数： 用来保存计算的结果
				运算操作数：	
					第一操作数
					第二操作数
					
				ADD R0,R1, R2		
		
		指令是用来“运算”：运算符
						 操作数
```
	
	
- 伪指令(由编译器厂商定的，keil环境下有keil的伪指令，
			gnu环境有gnu的伪指令)
```
		int a = 5;
		
	=>
		a
			DCD 5
```

- 宏指令(同上，由编译器厂商指定)
	
	
### ARM指令的寻址方式
			

### ARM指令的格式

ARM指令的基本格式:

```asm
	<opcode>{<cond>}{S} <Rd>, <Rn> {, <operand2>}
```
> <>内的必须要的 {} 可选的
		
- ` opcode `: operator code 操作码，指令助记符，表示哪条指令
	如:	
	```
		MOV
		ADD
		SUB
		...
	```

- ` cond `: condition 条件。该指令执行的条件。如果省略不写，
		则表示该条件指令无条件执行(必须执行)
	```	
		if (r1 == r2)
		{
			r0 = 250;  // MOV R0, #250
		}
		=>
			CMP R1, R2;   => if R1 == R2 , R1 - R2结果为0,
							 xPSR.Z == 1
							 
			//MOV(xPSR.Z == 1) R0, #250
			MOVEQ R0, #250
				EQ "equal"  => 检查 xPSR.Z == 1
			EQ => 条件
				条件码			含义			   测试的标志(xPSR中的标志位)
				EQ				Equal(相等)     		Z==1
				NE				Not Equal(不相等)       Z==0
				CS/HS			Carry Set (C == 1)
								unsigned Higher or Same  C == 1
								>=
								a >= b
								a - b无须借位。=> a >= b
								"无须借位" 表示　做减法时 不需要借位
								C == 1
								C == 1表示在做减法时，没有借位。
				
				CC/LO			Carry Clear(C == 0)		C == 0
								unsigned LOwer
										<
								a < b
								a - b就需要借位(C == 0)
			
				MI				MInous(负数)			N == 1
								a < b
								a - b < 0(N == 1)
				
				PL				Positive or Zero(非负数)	N == 0
								a >= b
								
				VS				V Set(溢出)				V == 1
				
				VC				V Clear(没溢出)			V == 0
				
				HI				unsigned HIgher			(C == 1) && (Z == 0)
								a > b
								a - b > 0
								a - b 没有借位(C == 1)并且结果不为0(Z == 0)
								
				LS				unsigned Lower or Same	 (C == 0) || (Z == 1)
								a <= b
								a - b <= 0
								
				GE				signed Greater or Equql     N == V
								>=
			
				LT				Less Than					N != V
								 <
								 
				GT				Greater Than				(N == V) && (Z == 0)
									>
				LE				Less than or Equal			(Z==1) ||(N != V)	
				

	```

- ` S `:  Status 表示该指令执行结果是否影响xPSR(程序状态寄存器)的标志位
		
如：
```asm
	MOV R0, #0 ; -> 不会影响任何状态标志
	MOVS R0, #0 ; ->会影响状态标志位
```
有一些指令如: CMP, CMN, TEQ ... 这些不加S也影响状态标志位,
因为这些指令，不保存运算结果，只影响状态标志位

> *Rd*: Register Desatiation 目标寄存器, 用来保存运算的结果 <br/>
> *Rn*: 第一个操作数
	
- ` operand2 `: 第2个操作数(有些指令没有第二个操作数)，有如下形式:
1. #immer_8r 立即数(常量表达式)
	立即数 -> 常数
	不是所有的常数都可以成为"立即数"，why?
	整个指令，只有32bits,这32bits需要保存指令助记符，
	目标寄存器的编号，第一个操作数的编号，剩下的几个bits
	是用来保存第二个操作数，……bit位数非常有限，so,
	```asm
		ADD R0, R1, #250		
		ADD R0, R1, #0x10
		ADD R0, R1, #(1 << 3) | (1 <<4)
    ```
	不是所有的常数都可以用来表示“立即数”，那哪些常数值
	可以用来表示立即数呢？ 
	每个立即数由一个8位的常数循环右移偶数位得到。
	其中循环右移的位数由一个4位二进制的两倍表示。
	如果立即数记作<immediate>,8位常数记作immed_8,
	4位的循环右移值记作rotate_imm，
	则有：<immediate>=immed_8循环右移（2*rotate_imm）
	如:

2. Rm 寄存器
	第二个操作数可以是一个寄存器。
	如:
	```asm
		ADD R0, R1, R2; R1 + R2 -> R0
    ```
						
3. Rm,shift 寄存器称位方式

第二个操作数可以是一个寄存器加移位方式

移位：

- 算术移位： 有符号的概念.请尽量不要改变符号
- 算术左移: 左边的高位直接干掉，右边补0
- 算术右移：右边的低位直接干掉，左边全部补符号位。
- 逻辑移位： 无符号的概念。无论是左移还是右移全部补0.

C语言的中的移位是算术移位还是逻辑移位？			

```c
	int 
		-1 >> 30   ? -1
		-1u >> 30  ?  3
						
		typeof(-1) => int
		typeof(-1u) => unsigned int
```


	LSL #n
		Logic Shift Left 逻辑左移n位,
		Logic逻辑移位，无论是左移还是右移，空出的位，都补0
	LSR #n
		Logic Shift Right 逻辑右移n位,
						
		在移出的位为0的情况下， 
		LSL #n 就相当于在原寄存器值 乘以 2的n次方
		LSR #n 就相当于在原寄存器值 除以 2的n次方
					
	ASR #n 算术右移n位
		算术移位，不应该改变它的符号。
		最高n位补符号位的值.
						
	ASL #n  没有。 => LSL 				
				
	ROR #n		ROtate Right 循环右移
		把右边移的n位，补到最左边。
						
	RRX 带扩展的循环右移1位
		带C(xPSR.C) 那个位
				
				
	type Rs
		type为上述移位方式的一种，如: LSL, LSR,ASR, ROR, RRX...
		Rs偏移量寄存器，低8位有效，要移的bit位数保存在Rs中。

如:
```asm
	MOV R1, #8
	LSL R1 => 逻辑左移8位。
```
							
如:
```asm
	ADD R0, R1, R2, LSR #2
	; R1 + R2 >> 2 -> R0
```
			
例子start.s			
				
				
四、ARM指令(UAL)
	1. ARM存储器访问指令
		用来在存储器(Memory,) 《－》寄存器之间传递数据
		
		把数据从存储器 -> 寄存器  加载 Loader
		把数据从寄存器 -> 存储器  存储  Store
		
		(1) 
			LDR{cond} {S}	{B/H}	Rd, <地址>
			STR{cond}   	{B/H}	Rd, <地址>
			
			LDR加载，把存储器<地址>中的内容加载到 寄存器Rd中
			STR存储，把寄存器Rd中的内容，存储到存储器<地址>中去
			
			存储器的地址是按字节编号的，
					[0x2000 0000] -> R1
					请问，你是加载一个字节，还是两个字节，还是4个字节呢？
		
			NOTE：
			a. B: Byte一个字节， H: Half word半字(两个字节), 如果省略，默认为4个字节
				B/H决定加载/存储多少个字节
			
			   S: Signed把地址的那个变量，当作是一个有符号的。
				如果没有S就把地址的那个变量，当作是一个无符号的。
				短 -> 长的（B/H）。有符号来说，高位全部补符号位，
						如果是无符号的，高位全部补0
			
			b. 地址确定方式： 基址寄存器 + 偏移量
				地址值肯定需要在一个寄存器中
				即：
											地址值		
					[Rn, 偏移量]  		Rn + 偏移量		Rn值不变
					[Rn, 偏移量]!		Rn + 偏移量		Rn值=Rn+ 偏移量
					[Rn], 偏移量		Rn				Rn值=Rn +  偏移量
					
					[]内表示存储器的地址值 ，
						如果有!或，偏移量在[]外边，则表示做完后，基址值自动增加偏移量
					偏移量有以下3种方式:
						立即数:
							如:	 LDR R1, [R0, #0x12]
									[R0+0x12] -> R1
						寄存器
							如:	LDR R1, [R0, R2]
									[R0+R2] -> R1
						寄存器及移位常数
							如:	LDR R1, [R0, R2, LSL #2]
									[R0 + R2 << 2] -> R1
					
			例子：
			(1.1)	char ch =0x80; //编译时刻或运行时刻，为ch分配一个存储器空间 0x2000 0000
				int a;	//编译时刻或运行时刻，为a分配一个存储器空间  0x2000 0004
				a =	ch;
				
				MOV R0, #0x20000000 ;
				MOV R1, #0x80
				STRB R1, [R0]
				
				
				LDRSB	R3, [R0]
				
				ADD R2, R0, #4
				STR R3, [R2]
				
			(1.2)
				unsigned char ch =0x80; //编译时刻或运行时刻，为ch分配一个存储器空间 0x2000 0000
				int a;	//编译时刻或运行时刻，为a分配一个存储器空间  0x2000 0004
				a =	ch;	

				MOV R0, #0x20000000 ;
				MOV R1, #0x80
				STRB R1, [R0]
				
				
				LDRB	R3, [R0]
				
				ADD R2, R0, #4
				STR R3, [R2]
				
			(1.3)
				C语言，全局变量			int a = 5;
						局部变量		int a = 5;
						
						
				//全局变量是编译时刻就需要确定内存地址的
					int a = 5 ;  // Keil
					
				a
					DCD 5
					
				//局部变量是运行时刻确定其地址的
					int a = 5;
					MOV R0, SP  ;//当前栈顶的地址，作为变量a的地址
					SUB SP, SP ,#-4 //栈顶元素--
					
					MOV R1, #5
					STR R1, [R0]
						
		(2) 多寄存器存取
			在一个连续的存储器地址上，进行多个寄存器的存取。
			加载 LDR  多 Multi
			
			多寄存器加载   LDM  Loader Multi
			多寄存器存储   STM	Store  Multi
			
			LDM{cond}<模式>  Rn{!}, reglist
			STM{cond}<模式>	Rn{!}, reglist
			
			a. 这两条指令只是通过一个寄存器 Rn指定了一个存储器的地址，
			   存储器的多个地址，是连续增加，还是连续递减呢?
				由<模式>来指定:
				注意：无论是哪种模式，低地址都是对应编号低的寄存器
					IA: Incrememt After() 每次传送后地址自动增加(+4) <-----
					DB: Decrement Before  每次传送前地址自动减少(-4) <-----
					IB: Increment Before  每次传送前地址先自动增加(+4)
					DA：Decrement After   每次传送后地址自动减少(-4)
					
					ARM Cortex M4只使用IA, DB
			b. reglist: 表示寄存器列表，可以包含多个寄存器，
				使用","隔开，寄存器由小到大排列
					如： {R1,R3,R4,R5}
						{R1,R3-R5}
						
			c.	 !  可加可不加
				加： 表示最后存储器的地址写入到Rn中去。
				不加： 最后Rn的值不变
				
				
			例子： 模拟C函数的实现
					“现场保护” ：
					“现场恢复”
					
				MOV R0, #0x20000000
				ADD R0, R0, #0x10 ;  R0 <- 0x20000010
								 ;把内存地址0x20000010那块空间，当作是一个“栈”’
				
				MOV R1, #1
				MOV R2, #2
				MOV R3, #3
				
				
				;如下是另外一个过程的代码
				; "现场保护" R1 - R3  => 内存
				STMDB	R0!, {R1-R3}
						; DB: Decrement Before,传送前，先-4
						
						; R0 = R0 - 4: 0x2000 000C
						; COPY: R3 -> [0x2000 000c]
						
						; R0 = R0 - 4: 0x2000 0008
						; COPY: R2 -> [0x2000 0008]
						
						; R0 = R0 - 4: 0x2000 0004
						; COPY: R1 -> [0x2000 0004]
				
				
				MOV R1, #0
				MOV R2, #0
				MOV R3, #0
	
	
				;"现场恢复"
				LDMIA R0!, {R1-R3}
		(3) 堆栈操作：堆栈的低地址对应编号低的寄存器
				压栈:	PUSH <reglist>
				出栈: 	POP   <reglist>
				
				"栈"就是一块内存，上面那两条指令，并没有指定内存地址，
				PUSH, POP用的地址寄存器是SP
				
				堆栈有四种类型：	
					A: add 递增堆栈   D: Dec递减堆栈
					SP堆栈 栈顶指针，
						栈顶指针可以保存元素   -> 满堆栈  Full
						也可以指向空(不保存元素) ->空堆栈  Empty
						
				EA: 空递增
					PUSH X
						X -> [SP]
						sp ++
						
					POP  x
						sp--
						[sp] -> x
				
				FA: 满递增
					PUSH X
						sp ++
						x -> [SP]
						
					POP x
						[sp] -> x
						sp --
					
				
				
				ED: 空递减
					PUSH X
						x -> [sp]
						SP--
					POP x
						sp++
						[sp] -> x
				
				
				FD: 满递减     <----- ARM采用的堆栈形式是: FD满递减堆栈
					PUSH X
						sp--
						x -> [sp]
						
					POP x
						[sp] -> x
						sp++
					
				
				例子： C函数的实现
					“现场保护” ：
					“现场恢复”
					
				
				
				MOV R1, #1
				MOV R2, #2
				MOV R3, #3
				
				
				PUSH {R1-R3}
				
				
				MOV R1, #0
				MOV R2, #0
				MOV R3, #0
	
	
				;"现场恢复"
				POP {R1-R3}
				
				请分析以上代码，执行：
					相应的堆栈中的内容是什么
						SP: 0x2000 0408

				
	2. ARM数据处理指令  -> 对寄存器内容操作
		数据传送指令
		算术运算指令
		逻辑运算指令
		比较指令
		(1) 数据传送指令
			MOV{cond}{S} Rd, operand2 ; Rd <-- operand2
			MVN{cond}{S} Rd, operand2 ;  Rd <--- ~operand2(取反) 
			
			
			S: 表示结果影响xPSR状态标志位
				第二操作数 operand2 -> Rd
				如:
					MOV R0, #3
					MOV R1, R0
					MOV R2, R1, LSL #2
			
	
			－－－－－
			register int a = 5; //register寄存器变量，建议编译器把后面的
								//的那个变量放到寄存器中，why?
								//	考虑程序经常频繁访问a,放在寄存器中要比
								// 放到内存中，要快。
								
								
			MOV R8, #5
			
		(2) 算术运算： 加减
			ADD{cond}{S} Rd, Rn, operand2;		Rd <--- Rn + operand2
			ADC{cond}{S} Rd, Rn, operand2;  	Rd <--- Rn + operand2 + xPSR.C
			
			例子:
				实现64bits 加法  a + b  -> c
				a : R1   R0
				b : R3   R2
				c : R5	 R4
				
				ADDS R4, R2, R0
				ADCS R5, R3, R1
				
			SUB{cond}{S} Rd, Rn, operand2;  Rd <--- Rn - operand2
			SBC{cond}{S} Rd, Rn, operand2;  Rd <--- Rn - operand2 - !xPSR.C 带借位的减法
	
			例子	实现64bits 加法  a - b  -> c
				a : R1   R0
				b : R3   R2
				c : R5	 R4
				
				SUBS R4, R0, R2  ; 此时 if R0 - R2产生的借位 -> xPSR.C == 0?
				SBCS R5, R1, R3  ;    R1 - R3 - 借位
									借位： !xPSR.C
				
			RSB 逆向减法指令
				Reserve
			RSB{cond}{S} Rd, Rn, operand2;  operand2 - Rn  -> Rd
			RSC{cond}{S} Rd, Rn, operand2;  operand2 - Rn - !xPSR.C -> Rd 带借位的逆向减法
			
		(3) 逻辑运算指令 (按位)
			AND{cond}{S} Rd, Rn, operand2; AND 与， Rn & operand2 -> Rd 按位与
			ORR{cond}{S} Rd, Rn, operand2; OR 或，  Rn | operand2 -> Rd 按位或
			EOR{cond}{S} Rd, Rn, operand2; EOR 异或 Rn ^ operand2 -> Rd 按位异或
			
				BIt Clear 位清零，把一个指定寄存器的中，指定的bit位给清掉
			BIC{cond}{S} Rd, Rn, operand2;  Rn & (~operand2) -> Rd
					把Rn中 operand2中的为1的哪些位置上的bit位清掉。
					
				MOV R0, #0xf
				BIC R2, R1, R0
					把R1的低四位清掉，再赋值给R2
					
		(4) 比较指令： 不需要加S,直接影响xPSR中的标志位。运算结果不保存。
			CMP Rn, operand2; 比较Rn与operand2的大小  Rn - operand2
				if Rn == operand2 
				CMP Rn, operand2
					xPSR.Z == 1 => EQ
					
					
			CMN Rn, operand2; 比较Rn与operand2的大小， Rn + operand2(负数比较)
				思考一下!!!
			
			TST Rn, operand2 ; Rn & operand2
				用来测试Rn中特定的bit位是否为1.
					Rn & operand2  => xPSR.Z == 1
									=> 说明operand2中为1的哪些bit的，在
										Rn都为0!!!!!!!!
			
				例子:
					测试R2中的第2和第3bit位,是否为1
						1100
										
					TST R2, #(1 << 3) | (1 << 2)
						xPSR.Z == 1 => EQ
						xPSR.Z == 0 => NE
						
			TEQ	Rn, operand2 ; Rn ^ operand2
					Rn == operand2 => Rn ^ operand2 == 0 => xPSR.Z == 1
					
			
	
	
	
	
	
	3. 乘法指令
		略
		
	4.分支指令:用来实现代码的跳转
		有两种方式可以实现程序的跳转
		(1) 分支指令
			B   lable ;  lable -> PC,  不带返回的跳转 
							
			BL  lable ;	 LR <- PC - 4(基于指令三级流水线，)
							PC - 4下一条指令的地址。
						PC <-	lable
						
						BL lable; 过程调用，函数调用
			
		(2) 直接向PC寄存器赋值
			MOV PC, LR
			MOV PC, #0x80000000
	
	
	5. 杂项指令
	
				SoftWare Interrupt 软中断
				SVC
		SWI
		SVC{cond} #immer_24
			SVC用来产生一个软件中断，从而实现从非特权等级到特权等级的切换。
			然后跳转到SVC的异常服务程序中去。 Handler Mode(特权) -> Thread Mode(特权)
			这个用于在嵌入式操作系统中，用来实现“系统调用”.
				"系统调用": 调用操作系统的函数。
						open/read/write/close/.... => linux系统调用
						
						SVC/SWI	 #24bits立即数  （表示不同的调用编号）
			
		
		MRS	Rd,  xPSR
			程序状态寄存器的值 赋值给Rd
			
		MSR xPSR, Rd
			将通用寄存器Rd的值，赋值给程序状态寄存器
			
			xPSR: APSR, IPSR, EPSR
		
	
	
	
	6.伪指令: 
		伪指令，机器不识别，但是可以表示程序员或编译器的某种想要的操作。
		编译器会把伪指令变成一条或多条合适的机器指令。
		
		(1) NOP
				No Operation 
			空操作，不产生任何实际的效果，但是占用机器周期。
			
				(1)
				NOP
				NOP
				(2)
				
			NOP
				-> MOV R0, R0
				   MOV R1, R1
				   MOV R2, R2
				   .....
				   只要您高兴就OK啦
				
				
		(2) LDR{cond} Rd, =expr
			LDR伪指令用于加载表达式expr的值，到寄存器Rd中去。
			
				LDR Rd, =expr
			=>
					expr: (1<< 2) | (1<<3)
				a: 如果expr是一个合法的立即数
					LDR Rd, =expr
					=>	MOV Rd, #expr
					
				b: 如果expr不是一个合法的立即数（0-255）
					LDR Rd, =0x12345678
					
					MOV R0, #0x12; 24
					MOV R1, #0X34   16
					MOV R2, #0x56   8
					MOV R3, #0x78
					左移+或
					
					
				XXX	
					DCD 0x12345678 
						
四、ARM程序设计
	1. if/else 如何实现的
		
		if (a > b)
		{
			a = 5;
		}
		else
		{
			b = 5;
		}
		
		
		=>
			R0 -> a   
			R1 -> b   
			
			if (R0 > R1)  CMP R0, R1
			{
				R0  = 5;  MOVGT R0, #5
			}
			else
			{
				R1 = 5;  MOVLE	R1,#5
			}
		---------
			CMP R0, R1
			MOVGT R0, #5	(a) 这条指令执行还是不执行，要等 “取指” -> 译码 才确定这条指令是否满足条件！！！
									if 译码时发现 GT条件满足，则清空流水线，然后再取下一条指令
			MOVLE R1, #5		(b)
		or
			CMP R0, R1
			MOVLE R1, #5
			MOVGT R0, #5
			
			
		so, 如果有什么外部提示，R0 > R1的概率大一些的话，
				CMP R0, R1
				MOVGT R0, #5
				MOVLE R1, #5
				
			如果有什么外部提示, R0 < R1的概率大一些的话
				CMP R0, R1
				MOVLE R1, #5
				MOVGT R0, #5
				
			提高预取指的命中率。
			
			
			if ( likely(a > b) )
			{}
			else
			{}
			
			likely(x) :编译器的修饰词，告诉编译器，后面的这个表达式x很有可能成立 
			unlikely(x):编译器的修饰词，告诉编译器，后面的这个表达式x不太可能成立
	2. 循环是如何实现的
	
		for (i = 1, sum = 0; i <= 10;i++)
		{
			sum = sum + i;
		}
		
		=>
			把变量 -> 寄存器
			i -> R0
			sum-> R1
			
		
			;循环的初始条件，各个变量的初始值
			MOV R0, #1
			MOV R1, #0
			
			;用两个标号，分别标识循环体的开始和结束
			;只用一个标号，也可以，标识循环体的开始
		loop
			CMP R0, #10
			BGT loop_end  ; GT R0 > 10
		
			ADD R1, R1, R0 
			ADD R0, R0, #1 
			B loop
		loop_end
		
		练习:
			1. 写汇编实现求10内奇数之和
			
			
			
				;循环的初始条件
				MOV R0, #0
				MOV R1, #1
				
			loop
				
				ADD R0, R0, R1
				ADD R1, R1, #2
				
				CMP R1, #10
				BLT loop
			      	
				
	3. 过程调用(函数调用)如何实现
		ATPCS: ARM/Thumb Procedure Call Standard 
				ARM/Thumb过程调用标准
			ARM定的.
		过程调用:
		(1)参数传送用 R0, R1,R2, R3,如果超过4个参数，后面的参数需要放到栈空间
		(2) 函数的返回值用R0,如果是64bits，用R1 R0.超过64bits的返回值，不支持;
			"单值类型"
		(3) 函数实现
			“现场保护”
				 Reglists  -> 栈  PUSH {寄存器列表}
				传递参数的那几个寄存器你不需要保护, why? 
					因为那几个寄存器本身就是传递给你用的，你无须保护。
				
				建议： 非参数寄存器(除了SP,PC)都要保存
				
					假设你的过程参数用R0,R1
				PUSH {R2-R12,LR}
				
			"现场恢复"
				
					 假设你的过程参数用R0,R1
				POP {R2-R12, LR}
				
				
				LR也要保存，否则，在过程中，就不能调用其他过程啦，
				原因： 你懂的。
				
				
			－－－－－
			例子：假设你的过程参数用R0,R1
			
			xxxx
				;现场保存
				PUSH {R2-R12, LR}
				
				.....
				
				
				;把过程的返回值保存在R0
				
				;现场恢复
				POP {R2-R12, LR};
				MOV PC, LR; 过程的返回， return 
				
					or
					POP {R2-R12, PC} //现场恢复，并返回!!!
					
	4. 汇编文件 与 C文件共存
		在汇编文件中调用 C文件的全局变量或全局函数，
		需要在汇编文件，引入相应的全局变量名或全局函数， “符号”
			IMPORT  函数名or全局变量名
			
		
		在C文件中调用汇编文件的函数，你必须按C的声明格式去声明
				extern 
			另外在汇编文件中，需要用EXPORT把相应的全局变量名或全局函数名，导出
			
			
	作业:
		1. 用汇编语言实现一个函数，判断a是否为b的倍数
		
			C:
				/*
					return 1: a是b的倍数
					return 0: a不是b的倍数
				*/
				int Is_Multi(int a, int b) 3,2
				{
					int i = b; 2
					
					while (b <= a)
					{
						if (a == b)
						{
							return 1;
						}
						b = b + i;
					}
				
					return 0;
					
				}
		
		
			汇编:
			
			Is_Multi  PROC
				
				; 现场保护
				PUSH {R2-R12, LR}
				
				; 函数的具体实现
				
					; R3 -> a
					; R1 -> b
					;循环初始化   R0, R1, R2保存原始的R1值
					MOV R2, R1
					MOV R3, R0
					MOV R0, #0 ; //默认不是倍数
			loop
				CMP R3, R1    a--b
				BLT loop_end
				MOVEQ R0, #1
				BEQ loop_end
				
				ADD R1, R1, R2
				B loop
				
				
				
			loop_end
								
				; 现场恢复
				POP {R2-R12, PC}
			
			
			
			
				ENDP
		
		
		
		
		
		2.  用汇编语言实现一个函数，判断一个数x是否为质数
		
			C:
				int Is_Prime(int x)
				{
					int i ;
					
					for (i = 2; i < x; i++)
					{
						if (Is_Multi(x, i))
						{
							return 0;
						}
					}
					
					return 1;
				}
				
			汇编:
				
			Is_Prime  PROC
					;现场保护
				PUSH {R1-R12, LR}
						
					;具体的实现
						; x -> R3
						; i -> R4
						MOV R3, R0
						MOV R4, #2
						MOV R5, #1 ;//函数的返回值
			loop_x
				  ; i < x
				  CMP R4, R3
				  BGE loop_x_end
				  
				  MOV R0, R3
				  MOV R1, R4
				  BL Is_Multi
				  
				  CMP R0, #1
				  MOVEQ R5, #0
				  BEQ loop_x_end
			
				  ADD R4, R4, #1
				  B loop_x
			
			loop_x_end
					
			
				  MOV R0, R5; 函数的返回值，要保存在R0中
					;现场恢复					
				POP {R1-R12, PC}
			
			
				ENDP
			
		
		
		
		3. 用汇编语言实现100以内所有素数之和
		
			(1) 直接查表。
				把100以内所有的质数，都保存在一个数组中。
				
				int a[100] = {2}; //保存100以内所有的素数
				int i_a = 1; //下标，表示数组a中的元素个数
				int sum = 2;
				
				x是不是质数
					2 ~ x-1 一个一个去整除x
					
					拿 < x的所有素数去整除x,即可。
				
					for (x = 2; x <= 100; x++)
					{
						for (i = 0; i < i_a; i++)
						{
							if (x % a[i] == 0)
							{
								break;
							}
						}
						
						if (i == i_a)
						{
							a[i_a++] = x;
							sum += x;
						}
					}
					
			=> 汇编
			
			
				烧写： 只能操作 ROM
				
			
				AREA yyyy, DATA, READWRITE
			x
				SPACE 400
			
				
			
				AREA xxx, DATA, READONLY
				
			a
				DCD 2
				DCD 3
				SPACE 400
				
				END
				
			
			
				代码:
					
					LDR R0, =a
					LDR R1, =x
					
					LDR R2, [R0], #4
					STR R2, [R1], #4
					
					
		------------------------------------
		
		
			AREA xData,DATA, READWRITE
		prime
			SPACE 400
		prime_i
			SPACE 4
			
			
			
			AREA xCode,CODE, READONLY
			
		
		prime_sum PROC
			
				;现场保护
				PUSH {R1-R12, LR}
				
				;函数的具体实现
					
					;prim_i数组的下标
				MOV R6, #0
					; R4值  ？以内所有素数之和
				MOV R4, R0;
					; sum -> R5
				MOV R5, #0
					; 2 ~ R4 所有素数之和
					; x -> R7
				
				for (R7 = 2; R7 <= R4; R7++)
				{			

				

					MOV R7, #2
				loop_2
					CMP R7, R4
					BGT loop_2_end			
				
				
				
					for (R8 = 0; R8 < R6; R8++)
					{
						if (Is_Multi(R7, prime[R8]))
						{
							break;
						}
					}
				
						
							
						MOV R8, #0
					loop_1
						 CMP R8, R6
						 BEQ loop_1_end
						
						 MOV R0, R7
						 
						 LDR R2, =prime
						 MOV R3, R8, LSL #2 ; //偏移量就在R3,基址在R2
											; //数组元素 prime[R8]的地址 R2 + R3
											
						 ADD R3, R2, R3;  ; R3 就是数组元素prime[R8]的地址
						 LDR R1, [R3]
						 BL is_multi
						 CMP R0, #1
						 BEQ loop_1_end
						 ADD R8, R8, #1
						 B loop_1


					loop_1_end
					
					
					
					
					if (R8 == R6)
					{
						R5 += R7;
						prime[R6 ++] = R7;
					}
					CMP R8, R6
					ADDEQ R5,R5,R7
					LDREQ R1, =prime
					MOVEQ R2, R6, LSL #2  ; R6数组下标，地址偏移量值  R6 * 4
					ADDEQ R1, R1, R2
					STREQ R7, [R1]
					ADDEQ R6,R6, #1
				
					ADD R7, R7, #1
					B loop_2
				
					
				loop_2_end
	
				
				}
				
											
				MOV R0, R5
				;现场恢复
				POP {R1-R12, PC}		
		
		 
			ENDP

				
			
			// x以内所有的素数之和
			int prime_sum(int x)
			{}	