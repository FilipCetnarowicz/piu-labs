export function generateID() {
    return 'shape-' + Math.random().toString(10).slice(2);
}
export function generateColor() {
    const hue = Math.floor(Math.random() * 100); // celowo jest * 100 zamiast * 360, bo tak jest ładniej
    return `hsl(${hue}, 75%, 75%)`;
}
