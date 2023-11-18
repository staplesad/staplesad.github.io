function load_json(file){
  return fetch(file).then((response) => response.json())
}

function tableCreate(data) {
  const div = document.getElementById("ev_table"),
  tbl = document.createElement('table');
  tbl.style.width = '100px';

  names = Object.keys(data);
  names.sort();
  for (let i=0; i< names.length; i++) {
    n = names[i][0].toUpperCase() + names[i].slice(1);
    ev = data[n];
    const tr = tbl.insertRow();
    for (let j = 0; j < 2; j++) {
      const td = tr.insertCell();
      let value = ""
      if (j===0) {
        console.log("if")
        value = n
      }
      else {
        console.log("else")
        value = ev
      }
      td.appendChild(document.createTextNode(`${value}\t\t`));
    }
  }
  div.appendChild(tbl);
}

data = load_json("./ev_table.json")
data.then((json) => tableCreate(json))
