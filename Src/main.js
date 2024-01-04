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

function MakeSinsRandomly(
	amount,
	amplitudeWidth = 2.5,
	amplitudeMin = 0.1,
	angularVelocityMax = 0.2,
	phaseShiftMax = 2 * Math.PI,
) {
	const sins = []
	const random = new Random(textSeed)
	for (let i = 0; i < amount; i++) {
		sins.push(
			new Sin(
				random.nextFloat() * amplitudeWidth + amplitudeMin,
				random.nextFloat() * angularVelocityMax,
				random.nextFloat() * phaseShiftMax,
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

function Plot(
	sinN,
	amplitudeWidth,
	amplitudeMin,
	angularVelocityMax,
	phaseShiftMax,
) {
	const sins = MakeSinsRandomly(
		sinN,
		amplitudeWidth,
		amplitudeMin,
		angularVelocityMax,
		phaseShiftMax,
	)

	let plotted = []

	const plotN = 500
	for (let i = 0; i < plotN; i++) {
		plotted.push(Func(i, sins))
	}

	return plotted
}

function Draw() {
	__HSS_GRAPHICS_PRIVATE.ctx.clearRect(0, 0, 1280, 780)

	SetColor(color)

	if (position == "rightFill") {
		DrawRightFill()
	} else if (position == "rightTopFill") {
		DrawRightTopFill()
	} else if (position == "top") {
		DrawTop()
	}
}

function DrawRightFill() {
	const sinsN = 3

	let plots = Plot(sinsN, 5, 2, 0.2, 0.1)

	const rightBottom = GetCanvasSize()
	const rightTop = [rightBottom[0], 0]

	plots.push(rightBottom)
	plots.push(rightTop)

	let polygon = new Polygon(plots, [0, 0], 0, 1)
	polygon.Draw()
}

function DrawRightTopFill() {
	const sinsN = 3

	let plotted = Plot(sinsN, 5, 2, 0.2, 0.1)

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

function DrawTop() {
	const sinsN = 3

	let plotted = Plot(sinsN, 3, 0.5, 0.15, 0.6)

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

function DrawByVector(start, direction, plots) {
	//normalize
	const directionNorm = (direction ** 2 + direction ** 2) ** 0.5
	const directionX = direction[0] / directionNorm
	const directionY = direction[1] / directionNorm

	const perpX = -directionY
	const perpY = directionX

	let xBase = start[0]
	let yBase = start[1]

	const RIGHT = GetCanvasSize()[0]
	const BOTTOM = GetCanvasSize()[1]

	let plotted = []
	while (0 <= xBase && xBase <= RIGHT && 0 <= yBase && yBase <= BOTTOM) {
		//plot
		let x = plots[cnt] * perpX + xBase
		let y = plots[cnt] * perpY + yBase

		plotted.push([x, y])

		//move
		xBase += directionX
		yBase += directionY

		cnt++
	}

	return plotted
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
