//for quality of life i created utility function that will adjust tech stack item name to match the img name
//and returns img tag

const getTechStackImg = (name: string) => {
    const fileName = name.trim().toLowerCase().replace(/[/\s]+/g, "_")
    return (
        <img
            src={require(`../../images/techStack/${fileName}.svg`)}
            alt={fileName}
        />
    )
}
export default getTechStackImg 