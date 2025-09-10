// Import the Pinecone library(Pinecone doesn't store data in sequence, but it stores based on similarity)
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client(pc) with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// already created 'cohort-chat-gpt' index in pinecone
const cohortChatGptIndex = pc.Index('cohort-chat-gpt')

async function createMemory({vectors, metadata, messageId}){
    // Pinecone requires string IDs. Coerce messageId to string to avoid type errors.
        // Pinecone expects an iterable (array) of vector records for upsert.
        await cohortChatGptIndex.upsert([
            {
                id: String(messageId),
                values: vectors,
                metadata
            }
        ])
}

async function queryMemory({queryVector, limit=5, metadata}) {
    // Use the query API instead of upsert. Pass the vector as `vector` and optional filter.
        // Call query with top-level params (vector/topK/filter) — matches the client API.
        // Only pass a filter if metadata has at least one key (Pinecone rejects empty filter objects)
        const filterObj = metadata && Object.keys(metadata).length ? metadata : undefined

        const data = await cohortChatGptIndex.query({
            vector: queryVector,
            topK: limit,
            filter: filterObj,
            includeMetadata: true
        })

        return data.matches || []
}

module.exports = {createMemory, queryMemory}