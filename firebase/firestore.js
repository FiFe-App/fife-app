import { limit, collection, query, where, getDocs } from "firebase/firestore";

const search = async (searchTxt) => {
    // First we build out all our search constraints
    const searchConstraints = [];
    triGram(searchTxt).forEach(name =>
        searchConstraints.push(where(`_smeta.${name}`, '==', true))
    );

    // Combine that with any other search constraint
    let constraints = [
        collection(getFirestore(), 'posts'),
        where('postType', '==', 'altfuel'),
        where('visibility', '==', 'public'),
        ...searchConstraints,
        limit(5)
    ];

    // Build the query and get the documents
    const q = query.apply(this, constraints);
    const querySnapshot = await getDocs(q);

    const results = [];
    querySnapshot.forEach(doc =>
        results.push({ _id: doc.id, ...doc.data() })
    );
    return results;
}
