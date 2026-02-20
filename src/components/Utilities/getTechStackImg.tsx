const getTechStackImg = (name: string) => {

    const fileName = name.trim().toLowerCase().replace(/[\/\s]+/g, "_")
    return (
        <img
            src={require(`../../images/techStack/${fileName}.svg`)}
            alt={fileName}
        />
    )
}
export default getTechStackImg 