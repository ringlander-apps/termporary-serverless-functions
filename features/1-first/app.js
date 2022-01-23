
const result = document.querySelector('.result');

const fetchData = async () =>{
    try {
        const {data} = await axios.get('/.netlify/functions/1-basic');//const {data} = await axios.get('/.netlify/functions/1-basic');
        result.textContent = data;
    } catch (error) {
        console.log(error.response.data);
    }
};

fetchData();