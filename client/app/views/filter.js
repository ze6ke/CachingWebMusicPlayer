const Filter = ({changeFilter}) => (
  <form onSubmit={(e)=>{e.preventDefault()}}>
    <input type="text" onChange={changeFilter} placeholder="filter"/>
  </form>
)

export default Filter
