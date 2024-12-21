import { useEffect, useRef, useState } from 'react'
import './App.css'
import { useQuery } from "react-query"


type Info = {
  email: string,
  category: string,
}
const initialInfo = {
  email: "",
  category: ""
}

function App() {
  const [error, setError] = useState<any>(false);

  useEffect(()=>{
    if(error !== false){
      setTimeout(()=>{
        setError(false)
      }, 4000)
    }
  }, [error])

  const fetchData = async () => {
    const result = await fetch("http://localhost:8000/category");
    const data = await result.json()
    return data;
  }

  const { data, } = useQuery<string[]>("categories", fetchData);
  const ref = useRef<HTMLInputElement>(null);
  const [info, setInfo] = useState<Info>(initialInfo);
  const sendData = async () => {
    const form = new FormData();
    form.append("user_email", info.email);
    form.append("category", info.category);
    if (ref.current?.files) {
      for (let i = 0; i < ref.current.files.length; i++) {
        form.append("files", ref.current.files[i]);
      }
      const result = await fetch("http://localhost:8000/upload", {
        method: 'POST',
        body: form
      });
      const data = await result.json()
      console.log(data)
      if (result.status >= 400 && result.status <= 499) {
        setError(data)
      }
      else if(result.status >= 200 && result.status <= 299){
        alert("Dados enviados e salvos!!! ")
      }
      return data;

    }

  }

  const handleSend = async () => {
    try {
      await sendData();
    }
    catch (e: any) {
    }
  }

  return (
    <section>
      <input ref={ref} type="file" name="file" id="file" accept='image/jpg' multiple />
      <input onChange={({ target }) => { setInfo({ ...info, email: target.value }) }} type="email" name="email" id="email" />
      <select onChange={({ target }) => { setInfo({ ...info, category: target.value }) }} name="categories" id="categories">
        <option unselectable='on'>Selecione uma categoria</option>
        {
          data?.map((category, key) => {
            return <option key={key} value={category}>{category}</option>
          })
        }
      </select>
      <button onClick={handleSend}>Enviar</button>
      {
        error !== false &&
        (
          <div className='modal-error'>
              <div className='modal-block'>
                <span>{error.detail[0].msg || "Houve um erro"}</span>
              </div>
          </div>
        )
      }
    </section>
  )
}

export default App
