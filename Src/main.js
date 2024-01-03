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

	const plotN = 900
	for (let i = 0; i < plotN; i++) {
		plotted.push(Func(i, sins))
	}

	for (let i = 1; i < plotN; i++) {
		let xPrev = plotted[i - 1] + 1220
		let yPrev = i
		let xCur = plotted[i] + 1220
		let yCur = i + 1
		DrawLine(xPrev, yPrev, xCur, yCur, 3)
	}
}
