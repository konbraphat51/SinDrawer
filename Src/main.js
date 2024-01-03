async function main() {
    await Sleep(1000)

    DrawText("Hello World!", 100, 100)

    await Sleep(1000)
    
    SetColor("red")
    SetFont("50px serif")
    DrawText("Let's Coding!", 100, 200)

    await Sleep(1000)

    
    const chick = (await LoadImages(["/Assets/twimoji_chick.png"]))[0]
    
    while (true){
        //clear
        SetColor("white")
        DrawRect(0, 0, GetCanvasSize()[0], GetCanvasSize()[1])

        DrawImage(chick, GetMouseX(), GetMouseY(), 100, 100)
    
        //cool time
        await Sleep(1000/16)
    }
}