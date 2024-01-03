SetCanvasSize(1280, 780)

class Sin {
	constructor(amplitude, angularVelocity, phase) {
		this.amplitude = amplitude
		this.angularVelocity = angularVelocity
		this.phase = phase
	}
}

function Func(x, sins) {
	let value = 0
	for (let i = 0; i < sins.length; i++) {
		value +=
			sins[i].amplitude * Math.sin(sins[i].angularVelocity * x + sins[i].phase)
	}

	return value
}

function MakeSinsRandomly(amount) {
	const sins = []
	for (let i = 0; i < amount; i++) {
		sins.push(
			new Sin(
				Math.random() * 0.5 + 1.5,
				Math.random() * 0.7,
				Math.random() * 100,
			),
		)
	}

	return sins
}

async function main() {
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
