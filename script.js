const services = {

Instagram:[
{
name:"Instagram Followers",
min:100,
max:10000,
price:0.02
},

{
name:"Instagram Likes",
min:50,
max:5000,
price:0.01
}

],

YouTube:[
{
name:"YouTube Views",
min:100,
max:10000,
price:0.015
}
]

};

function toggleMenu(){

const menu=document.getElementById("menu")

menu.style.left = menu.style.left === "0px" ? "-250px" : "0px"

}

function toggleTheme(){

document.body.classList.toggle("dark")

}

function scrollServices(){

document.getElementById("services").scrollIntoView({behavior:"smooth"})

}

function renderServices(){

const container=document.getElementById("services-container")

container.innerHTML=""

for(let category in services){

let catDiv=document.createElement("div")
catDiv.className="category"

catDiv.innerHTML=`<h3>${category}</h3>`

services[category].forEach(service=>{

let card=document.createElement("div")

card.className="service-card"

card.innerHTML=`

<h4>${service.name}</h4>

<p>Min: ${service.min}</p>
<p>Max: ${service.max}</p>
<p>Price: ₹${service.price}</p>

<button class="order-btn"
onclick="orderService('${service.name}',${service.min},${service.max},${service.price})">
Order
</button>

`

catDiv.appendChild(card)

})

container.appendChild(catDiv)

}

}

function orderService(name,min,max,price){

let quantity=prompt(`Enter quantity between ${min}-${max}`)

if(quantity<min||quantity>max){

alert(`Please enter quantity between ${min} and ${max}`)
return

}

let link=prompt("Enter public link")

let total=quantity*price

let message=`

Hello BYSO Team,

New Order Request

Service: ${name}
Quantity: ${quantity}
Link: ${link}
Price: ₹${total}

Please confirm the order.

`

saveHistory(name,quantity,link,total)

window.open(`https://wa.me/6282298431688?text=${encodeURIComponent(message)}`)

}

function saveHistory(service,quantity,link,price){

let history=JSON.parse(localStorage.getItem("orders"))||[]

history.push({
service,
quantity,
link,
price,
date:new Date().toLocaleString()
})

localStorage.setItem("orders",JSON.stringify(history))

renderHistory()

}

function renderHistory(){

let history=JSON.parse(localStorage.getItem("orders"))||[]

const container=document.getElementById("history-container")

container.innerHTML=""

history.reverse().forEach(order=>{

let div=document.createElement("div")

div.className="history-card"

div.innerHTML=`

<b>${order.service}</b>
<p>Qty: ${order.quantity}</p>
<p>Price: ₹${order.price}</p>
<p>${order.date}</p>

`

container.appendChild(div)

})

}

renderServices()
renderHistory()