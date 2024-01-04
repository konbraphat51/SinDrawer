SetCanvasSize(1280, 780)

const UP = 0
const DOWN = GetCanvasSize()[1]
const LEFT = 0
const RIGHT = GetCanvasSize()[0]

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

function _PlotFlat(
	sinN,
	plotN,
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

	for (let i = 0; i < plotN; i++) {
		plotted.push(Func(i, sins))
	}
	return plotted
}

function _PlotByVector(start, direction, plots) {
	//normalize
	const directionNorm = (direction[0] ** 2 + direction[1] ** 2) ** 0.5
	const directionX = direction[0] / directionNorm
	const directionY = direction[1] / directionNorm

	const perpX = -directionY
	const perpY = directionX

	let xBase = start[0]
	let yBase = start[1]

	const RIGHT = GetCanvasSize()[0]
	const BOTTOM = GetCanvasSize()[1]

	let plotted = []
	let cnt = 0
	while (
		0 <= xBase &&
		xBase <= RIGHT &&
		0 <= yBase &&
		yBase <= BOTTOM &&
		cnt < plots.length
	) {
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

function _DrawCurve(curve, lineWidth = 3) {
	for (let i = 0; i < curve.length - 1; i++) {
		DrawLine(
			curve[i][0],
			curve[i][1],
			curve[i + 1][0],
			curve[i + 1][1],
			lineWidth,
		)
	}
}

function Draw() {
	__HSS_GRAPHICS_PRIVATE.ctx.clearRect(0, 0, 1280, 780)

	SetColor(color)

	let plots = []
	let start = []
	let direction = []
	let lastAdding = []
	let polygonAtLast = false
	if (position == "rightFill") {
		plots = _PlotFlat(3, 1300, 3, 0.5, 0.15, 0.6)
		start = [1230, 0]
		direction = [0, 1]
		lastAdding = [
			[RIGHT, DOWN],
			[RIGHT, UP],
		]
		polygonAtLast = true
	} else if (position == "rightTopFill") {
		plots = _PlotFlat(3, 1300, 3, 0.5, 0.15, 0.6)
		start = [1100, 0]
		direction = [2 ** -0.5, 2 ** -0.5]
		lastAdding = [[RIGHT, 0]]
		polygonAtLast = true
	} else if (position == "top") {
		plots = _PlotFlat(3, 1300, 3, 0.5, 0.15, 0.6)
		start = [0, 30]
		direction = [1, 0]
	}

	let curve = _PlotByVector(start, direction, plots)

	if (polygonAtLast) {
		for (let i = 0; i < lastAdding.length; i++) {
			curve.push(lastAdding[i])
		}

		polygon = new Polygon(curve, [0, 0], 0, 1)
		polygon.Draw()
	} else {
		_DrawCurve(curve)
	}
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
