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
				Math.random() * 0.5 + 1,
				Math.random() * 100,
				Math.random() * 100,
			),
		)
	}

	return sins
}

async function main() {
	const sinsN = 3
	const sins = MakeSinsRandomly(sinsN)


