
const fetchData = async () => {
    try {
        const { data } = await axios.get('/api/auth/login');
        console.log(data);
    } catch (error) {
        console.log(error.response.data);
    }
}

fetchData();