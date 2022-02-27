class Obstacle {
  constructor(box, isDragable) {
    this.box = box;
    this.isDragable = isDragable;
    this.setColor();
  }

  setColor() {
    //Color
    let color;
    if (this.isDragable) color = [39, 174, 96];
    //Verde
    else {
      color = this.getRandomColor();
      this.box.useOctreeForPicking = false;
    }
    const material = new BABYLON.StandardMaterial(scene);
    material.alpha = 0.9;
    material.diffuseColor = new BABYLON.Color3(
      color[0] / 255.0,
      color[1] / 255.0,
      color[2] / 255.0
    );

    this.box.material = material;
  }

  getRandomColor() {
    const colores = [
      [231, 76, 60], //Rojo
      [155, 89, 182], //Morado
      [52, 152, 219], //Azul
      [241, 196, 15], //Amarillo
      [236, 240, 241], //Blanco
      [243, 156, 18], //Naranja
    ];
    return colores[parseInt(getRandom(0, colores.length))];
  }
}
