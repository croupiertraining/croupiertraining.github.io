export function int( from, to ) {
    from = from || 0;
    to = to || 1;

    return from + Math.floor( Math.random() * to );
}

export function elem( array ) {
    let i = int(0, array.length);

    return array[i];
}

export function shuffle( array ) {
    let j, x, i;

    for (i = array.length - 1; i > 0; i--) {
        j = int(0, i+1);
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }

    return array;
}
