const Filter = ({changeFilter, songs}) => (
  <span className="filter-span">
    <form onSubmit={(e)=>{e.preventDefault()}}>
      <span className="filter">
        <input type="text" className="filter-box" onChange={changeFilter} placeholder="filter"/>
        <span className="filter-icon" aria-hidden="true"></span>
      </span>Songs: {songs.length}
    </form>
  </span>
)

export default Filter
