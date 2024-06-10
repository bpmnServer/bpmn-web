import {} from './';
/**
 * Mongo Query:
 *  1.  {term1,term2..}  object keys, values => and
 *  2.  $and[term1,term2..]
 *  3.  $or[term1,term2..]
 * 
 *  term:
 *      a.  field: "value"
 *      b.  field: {$elementMatch: <query>
 *      c.  field: {<oper>: value}
 * 
 *  4.  $elemMatch
 * 
   { "_id": 1, "results": [ { "product": "abc", "score": 10 },
                            { "product": "xyz", "score": 5 } ] },
   { "_id": 2, "results": [ { "product": "abc", "score": 8 },
                            { "product": "xyz", "score": 7 } ] },
   { "_id": 3, "results": [ { "product": "abc", "score": 7 },
                            { "product": "xyz", "score": 8 } ] },
   { "_id": 4, "results": [ { "product": "abc", "score": 7 },
                            { "product": "def", "score": 8 } ] },
   { "_id": 5, "results": { "product": "xyz", "score": 7 } }
] )

db.survey.find(
   { results: { $elemMatch: { product: "xyz", score: { $gte: 8 } } } }
)

*  5.  operators:  $gt,$gte,$lt,$lte
        field:{}
*/
 
interface MQuery {
    [key: string]: any;
}

interface MDocument {
    [key: string]: any;
}
interface MProjection {
    [key: string]: 0 | 1 | MProjection;
}

class MongoQuery {

 static filterObjectsAndChildren(array: MDocument[], query: MQuery , childName:string): MDocument[] {
    let filteredObjects = MongoQuery.filterObjects(array,query);
    let output=[];
    let cQuery={};
    if (query[childName] && query[childName]['$elemMatch'])
        cQuery=query[childName]['$elemMatch'];

    filteredObjects.forEach(obj=>{
        let children=obj[childName];
        let filteredChildren=MongoQuery.filterObjects(children,cQuery);
        let newObj=(JSON.parse(JSON.stringify(obj)));
        newObj[childName]=filteredChildren;
        output.push(newObj)
    });

    return output;
}
static filterObjects(array: MDocument[], query: MQuery): MDocument[] {
    return array.filter(obj => {
        if ('$or' in query) {
            const orQueries: MQuery[] = query['$or'];
            return orQueries.some(orQuery => MongoQuery.filterObjects([obj], orQuery).length > 0);
        }

        if ('$and' in query) {
            const andQueries: MQuery[] = query['$and'];
            return andQueries.every(andQuery => MongoQuery.filterObjects([obj], andQuery).length > 0);
        }

        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                const queryValue = query[key];
                const objValue = obj[key];
                
                if (typeof queryValue === 'object' && !Array.isArray(queryValue)) {
                    for (const op in queryValue) {
                        if (queryValue.hasOwnProperty(op)) {
                            switch (op) {
                                case '$eq':
                                    if (objValue !== queryValue[op]) return false;
                                    break;
                                case '$gt':
                                    if (objValue <= queryValue[op]) return false;
                                    break;
                                case '$lt':
                                    if (objValue >= queryValue[op]) return false;
                                    break;
                                case '$gte':
                                    if (objValue < queryValue[op]) return false;
                                    break;
                                case '$lte':
                                    if (objValue > queryValue[op]) return false;
                                    break;
                                case '$ne':
                                    if (objValue === queryValue[op]) return false;
                                    break;
                                case '$in':
                                    if (!queryValue[op].includes(objValue)) return false;
                                    break;
                                case '$nin':
                                    if (queryValue[op].includes(objValue)) return false;
                                    break;
                                case '$elemMatch':
                                    if (!Array.isArray(objValue) || !objValue.some(item => MongoQuery.filterObjects([item], queryValue[op]).length)) {
                                        return false;
                                    }
                                    break;
                                default:
                                    // Handle unsupported operator
                                    throw new Error(`Unsupported operator: ${op}`);
                            }
                        }
                    }
                } else {
                    // Handle regular comparison
                    if (objValue !== queryValue) return false;
                }
            }
        }
        return true;
    });
}

static projectObjects(array: MDocument[], projection: MProjection): MDocument[] {
    return array.map(obj => {
        const projectedObj: MDocument = {};
        for (const key in projection) {
            if (projection.hasOwnProperty(key) && projection[key] === 1) {
                projectedObj[key] = obj[key];
            }
        }
        return projectedObj;
    });
}
}
///////////////////////////////////////////////
// Example usage
const data = [
    {
        name: 'John',
        age: 30,
        address: {
            city: 'New York',
            country: 'USA',
            coordinates: {
                latitude: 40.7128,
                longitude: -74.0060
            }
        },
        hobbies: [
            { name: 'Reading', type: 'Indoor' },
            { name: 'Hiking', type: 'Outdoor' },
            { name: 'Gaming', type: 'Indoor' }
        ]
    },
    {
        name: 'Alice',
        age: 25,
        address: {
            city: 'London',
            country: 'UK',
            coordinates: {
                latitude: 51.5074,
                longitude: -0.1278
            }
        },
        hobbies: [
            { name: 'Traveling', type: 'Outdoor' },
            { name: 'Cooking', type: 'Indoor' },
            { name: 'Photography', type: 'Outdoor' }
        ]
    },
    {
        name: 'Bob',
        age: 35,
        address: {
            city: 'Paris',
            country: 'France',
            coordinates: {
                latitude: 48.8566,
                longitude: 2.3522
            }
        },
        hobbies: [
            { name: 'Painting', type: 'Indoor' },
            { name: 'Running', type: 'Outdoor' },
            { name: 'Dancing', type: 'Indoor' }
        ]
    },
];

const query1: MQuery = {age:{'$gt':25}, hobbies: { $elemMatch: { type: 'Outdoor'} } };
//const query2: MQuery = {'$or':[{age:{'$gt':25}}, {addresses: { $elemMatch: { city: 'New York', country: 'USA' } } }]};

console.log('1',JSON.stringify(MongoQuery.filterObjects(data, query1)));
//console.log('2',JSON.stringify(MongoQuery.filterObjects(data, query2)));
//console.log('3',JSON.stringify(MongoQuery.filterObjectsAndChildren(data,query1,'addresses')));
//console.log(JSON.stringify(data1));

