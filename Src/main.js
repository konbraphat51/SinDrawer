const DEFAULT_CANVAS_WIDTH = 1280
const DEFAULT_CANVAS_HEIGHT = 780
const MIN_CANVAS_SIZE = 64
const DEFAULT_MAX_AMPLITUDE = 20

const UP = 0
const LEFT = 0

var textSeed = 0
var textSeedUnedited = 0
var color = document.getElementById("color").value
var position = document.getElementById("position").value
var canvasWidth = DEFAULT_CANVAS_WIDTH
var canvasHeight = DEFAULT_CANVAS_HEIGHT
var maxAmplitude = DEFAULT_MAX_AMPLITUDE

var axisPositionRateByPosition = {
	rightFill: 1200 / DEFAULT_CANVAS_WIDTH,
	rightTopFill: 1000 / DEFAULT_CANVAS_WIDTH,
	top: 0.1,
	topFill: 150 / DEFAULT_CANVAS_HEIGHT,
}

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
	angularVelocityWidth = 0.2,
	angularVelocityMin = 0.05,
	phaseShiftMax = 2 * Math.PI,
) {
	const sins = []
	const random = new Random(textSeed)
	for (let i = 0; i < amount; i++) {
		sins.push(
			new Sin(
				random.nextFloat() * amplitudeWidth + amplitudeMin,
				random.nextFloat() * angularVelocityWidth + angularVelocityMin,
				random.nextFloat() * phaseShiftMax,
			),
		)
	}

	return sins
}

function OnTextChanged(event) {
	const text = event.target.value
	textSeed = textSeedUnedited = TextToSeed(text)

	Draw()
}

function OnColorChanged(event) {
	color = event.target.value

	Draw()
}

function OnPositionChanged(event) {
	position = event.target.value
	RefreshAxisPositionInput()

	Draw()
}

function OnCanvasWidthChanged(event) {
	canvasWidth = Math.round(
		Math.max(MIN_CANVAS_SIZE, ToFiniteNumber(event.target.value, canvasWidth)),
	)
	event.target.value = canvasWidth

	SetCanvasSize(canvasWidth, canvasHeight)
	Draw()
}

function OnCanvasHeightChanged(event) {
	canvasHeight = Math.round(
		Math.max(MIN_CANVAS_SIZE, ToFiniteNumber(event.target.value, canvasHeight)),
	)
	event.target.value = canvasHeight

	SetCanvasSize(canvasWidth, canvasHeight)
	Draw()
}

function OnAxisPositionChanged(event) {
	const axisPositionPercent = Clamp(
		ToFiniteNumber(
			event.target.value,
			(axisPositionRateByPosition[position] ?? 0.5) * 100,
		),
		0,
		100,
	)

	axisPositionRateByPosition[position] = axisPositionPercent / 100
	event.target.value = axisPositionPercent.toFixed(3)

	Draw()
}

function OnMaxAmplitudeChanged(event) {
	maxAmplitude = Math.max(1, ToFiniteNumber(event.target.value, maxAmplitude))
	event.target.value = maxAmplitude

	Draw()
}

function TextToSeed(text) {
	let seed = 0
	for (let i = 0; i < text.length; i++) {
		seed += text.charCodeAt(i)
	}

	return seed
}

function ToFiniteNumber(value, fallback) {
	const parsed = Number(value)
	if (!Number.isFinite(parsed)) {
		return fallback
	}

	return parsed
}

function Clamp(value, min, max) {
	return Math.max(min, Math.min(max, value))
}

function InitializeConfigFromInputs() {
	canvasWidth = Math.round(
		Math.max(
			MIN_CANVAS_SIZE,
			ToFiniteNumber(
				document.getElementById("imageWidth").value,
				DEFAULT_CANVAS_WIDTH,
			),
		),
	)
	canvasHeight = Math.round(
		Math.max(
			MIN_CANVAS_SIZE,
			ToFiniteNumber(
				document.getElementById("imageHeight").value,
				DEFAULT_CANVAS_HEIGHT,
			),
		),
	)
	maxAmplitude = Math.max(
		1,
		ToFiniteNumber(
			document.getElementById("maxAmplitude").value,
			DEFAULT_MAX_AMPLITUDE,
		),
	)

	document.getElementById("imageWidth").value = canvasWidth
	document.getElementById("imageHeight").value = canvasHeight
	document.getElementById("maxAmplitude").value = maxAmplitude

	SetCanvasSize(canvasWidth, canvasHeight)
	RefreshAxisPositionInput()
}

function GetAxisLabelText(positionText) {
	if (positionText == "rightFill" || positionText == "rightTopFill") {
		return "Axis X (%)"
	}

	return "Axis Y (%)"
}

function RefreshAxisPositionInput() {
	const axisLabel = document.getElementById("axisPositionLabel")
	const axisInput = document.getElementById("axisPosition")

	const rate = Clamp(axisPositionRateByPosition[position] ?? 0.5, 0, 1)
	axisPositionRateByPosition[position] = rate

	axisLabel.textContent = GetAxisLabelText(position)
	axisInput.value = (rate * 100).toFixed(3)
}

function _ScalePlotsToMaxAmplitude(plots, maxAmplitudeToScale = null) {
	if (maxAmplitudeToScale == null || maxAmplitudeToScale <= 0) {
		return plots
	}

	let maxAbs = 0
	for (let i = 0; i < plots.length; i++) {
		maxAbs = Math.max(maxAbs, Math.abs(plots[i]))
	}

	if (maxAbs === 0) {
		return plots
	}

	const scale = maxAmplitudeToScale / maxAbs

	const scaled = []
	for (let i = 0; i < plots.length; i++) {
		scaled.push(plots[i] * scale)
	}

	return scaled
}

function _PlotFlat(
	sinN,
	plotN,
	amplitudeWidth,
	amplitudeMin,
	angularVelocityWidth,
	angularVelocityMin,
	phaseShiftMax,
	maxAmplitudeToScale = null,
) {
	const sins = MakeSinsRandomly(
		sinN,
		amplitudeWidth,
		amplitudeMin,
		angularVelocityWidth,
		angularVelocityMin,
		phaseShiftMax,
	)

	let plotted = []

	for (let i = 0; i < plotN; i++) {
		plotted.push(Func(i, sins))
	}

	return _ScalePlotsToMaxAmplitude(plotted, maxAmplitudeToScale)
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
	const RIGHT = GetCanvasSize()[0]
	const DOWN = GetCanvasSize()[1]
	__HSS_GRAPHICS_PRIVATE.ctx.clearRect(0, 0, RIGHT, DOWN)

	SetColor(color)
	const plotN = Math.ceil((RIGHT ** 2 + DOWN ** 2) ** 0.5) + 16
	const axisPositionRate = Clamp(axisPositionRateByPosition[position] ?? 0.5, 0, 1)
	axisPositionRateByPosition[position] = axisPositionRate

	let plots = []
	let start = []
	let direction = []
	let lastAdding = []
	let polygonAtLast = false
	if (position == "rightFill") {
		plots = _PlotFlat(3, plotN, 4, 10, 0.5, 0.3, 2 * Math.PI, maxAmplitude)
		start = [RIGHT * axisPositionRate, UP]
		direction = [0, 1]
		lastAdding = [
			[RIGHT, DOWN],
			[RIGHT, UP],
		]
		polygonAtLast = true
	} else if (position == "rightTopFill") {
		plots = _PlotFlat(3, plotN, 10, 10, 0.1, 0.6, 0, maxAmplitude)
		start = [RIGHT * axisPositionRate, UP]
		direction = [2 ** -0.5, 2 ** -0.5]
		lastAdding = [[RIGHT, UP]]
		polygonAtLast = true
	} else if (position == "top") {
		plots = _PlotFlat(4, plotN, 6, 2, 0.5, 0.6, 6, maxAmplitude)
		start = [LEFT, DOWN * axisPositionRate]
		direction = [1, 0]
	} else if (position == "topFill") {
		plots = _PlotFlat(2, plotN, 10, 5, 0.3, 0.1, 0, maxAmplitude)
		start = [LEFT, DOWN * axisPositionRate]
		direction = [1, 0]
		lastAdding = [
			[RIGHT, UP],
			[LEFT, UP],
		]
		polygonAtLast = true
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
	InitializeConfigFromInputs()
	Draw()
}

function SaveCanvas() {
	var link = document.createElement("a")
	link.href = __HSS_GRAPHICS_PRIVATE.canvas.toDataURL()
	link.download = "graph.png"
	link.click()
}
