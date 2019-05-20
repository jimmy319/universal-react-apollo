const messageApi = {
  getContent: async (userName) => {
    const fakeApiCall = () => new Promise((resolve, reject) => {
      setTimeout(() => resolve({
        content: `Hello ${userName}: this is your first universal react apollo app`
      }), 500)
    })

    const content = await fakeApiCall()

    return content
  }
}

export default messageApi
