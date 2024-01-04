SetCanvasSize(1280, 780)

var textSeed = 0
var color = document.getElementById("color").value
var position = document.getElementById("position").value

class Sin {
	constructor(amplitude, angularVelocity, phase) {
		this.amplitude = amplitude
		this.angularVelocity = angularVelocity
		this.phase = phase
	}

	Calc(x) {
		return this.amplitude * Math.sin(this.angularVelocity * x + this.phase)
	}
}

//https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
class Random {
	constructor(seed = 88675123) {
		this.x = 123456789
		this.y = 362436069
		this.z = 521288629
		this.w = seed
	}

	// XorShift
	next() {
		let t

		t = this.x ^ (this.x << 11)
		this.x = this.y
		this.y = this.z
		this.z = this.w
		return (this.w = this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8)))
	}

	// get 0-1 float
	nextFloat() {
		const absolute = Math.abs(this.next())
		const r = absolute % 1000
		return r / 1000
	}
}

function Func(x, sins) {
	let value = 0
	for (let i = 0; i < sins.length; i++) {
		value += sins[i].Calc(x)
	}

	return value
}

function MakeSinsRandomly(amount) {
	const sins = []
	const random = new Random(textSeed)
	for (let i = 0; i < amount; i++) {
		sins.push(
			new Sin(
				random.nextFloat() * 0.5 + 2.5,
				random.nextFloat() * 0.1,
				random.nextFloat() * 100,
			),
		)
	}

	return sins
}

function OnTextChanged(event) {
	const text = event.target.value
	textSeed = TextToSeed(text)

	Draw()
}

function OnColorChanged(event) {
	color = event.target.value

	Draw()
}

function OnPositionChanged(event) {
	position = event.target.value

	Draw()
}

function TextToSeed(text) {
	let seed = 0
	for (let i = 0; i < text.length; i++) {
		seed += text.charCodeAt(i)
	}

	return seed
}

function Draw() {
	__HSS_GRAPHICS_PRIVATE.ctx.clearRect(0, 0, 1280, 780)

	SetColor(color)

	if (position == "rightFill") {
		DrawRightFill()
	} else if (position == "rightTopFill") {
		DrawRightTopFill()
	}
}

function DrawRightFill() {
	const sinsN = 3
	const sins = MakeSinsRandomly(sinsN)

	let plotted = []

	const plotN = 780 + 1
	for (let i = 0; i < plotN; i++) {
		plotted.push(Func(i, sins))
	}

	let plots = []

	for (let i = 0; i < plotN; i++) {
		let x = plotted[i] + 1220
		let y = i
		plots.push([x, y])
	}

	const rightBottom = GetCanvasSize()
	const rightTop = [rightBottom[0], 0]

	plots.push(rightBottom)
	plots.push(rightTop)

	let polygon = new Polygon(plots, [0, 0], 0, 1)
	polygon.Draw()
}

function DrawRightTopFill() {
	const sinsN = 3
	const sins = MakeSinsRandomly(sinsN)

	let plotted = []

	const plotN = 500
	for (let i = 0; i < plotN; i++) {
		plotted.push(Func(i, sins))
	}

	let plots = []

	let directionX = Math.sqrt(2) / 4
	let directionY = Math.sqrt(2) / 4

	let perpX = -directionY * 2
	let perpY = directionX * 2

	let xBase = 1280 - 150
	let yBase = 0
	let cnt = 0
	while (xBase < 1280 && yBase < 780) {
		let x = plotted[cnt] * perpX + xBase
		let y = plotted[cnt] * perpY + yBase

		xBase += directionX
		yBase += directionY

		cnt++

		plots.push([x, y])
	}

	const rightTop = [GetCanvasSize()[0], 0]

	plots.push(rightTop)

	let polygon = new Polygon(plots, [0, 0], 0, 1)
	polygon.Draw()
}

async function main() {
	Draw()
}

function SaveCanvas() {
	var link = document.createElement("a")
	link.href = __HSS_GRAPHICS_PRIVATE.canvas.toDataURL()
	link.download = "graph.png"
	link.click()
}
