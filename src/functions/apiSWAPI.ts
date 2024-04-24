import { APIGatewayProxyEvent } from "aws-lambda";
import superagent from 'superagent';
import { People } from "../shared/models/ipeople";
import { Person } from "../shared/models/iperson";
import { errorHandle } from "../shared/utils/errorHandle";

const headers = {
  "content-type": "application/json",
};

const getPeople = async (_event: APIGatewayProxyEvent) => {
  try {
    const res = await superagent.get('https://swapi.py4e.com/api/people');

    const person: People = res.body;

    if (!person) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Not Found" })
      };
    };

    const respuesta = {
      contador: person.count,
      siguiente: person.next,
      previo: person.previous,
      resultado: person.results.map(item => {
        return {
          nombre: item.name,
          tamaño: item.height,
          masa: item.mass,
          color_cabello: item.hair_color,
          color_piel: item.skin_color,
          color_ojos: item.eye_color,
          año_nacimiento: item.birth_year,
          genero: item.gender,
          mundo_natal: item.homeworld,
          peliculas: item.films,
          especies: item.species,
          vehiculos: item.vehicles,
          naves_estelares: item.starships,
          creado: item.created,
          editado: item.edited,
          url: item.url,
        };
      }),

    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(respuesta)
    };
  } catch (err) {
    errorHandle(err);
  }

};

const getPerson = async (event: APIGatewayProxyEvent) => {
  try {
    const id = event.pathParameters?.id as string;
    const res = await superagent.get(`https://swapi.py4e.com/api/people/${id}`);

    const person: Person = await res.body;

    if (!person) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Not Found" })
      };
    };

    const respuesta = {
      nombre: person.name,
      tamaño: person.height,
      masa: person.mass,
      color_cabello: person.hair_color,
      color_piel: person.skin_color,
      color_ojos: person.eye_color,
      año_nacimiento: person.birth_year,
      genero: person.gender,
      mundo_natal: person.homeworld,
      peliculas: person.films,
      especies: person.species,
      vehiculos: person.vehicles,
      naves_estelares: person.starships,
      creado: person.created,
      editado: person.edited,
      url: person.url,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(respuesta)
    };
  } catch (err) {
    errorHandle(err);
  }

};

module.exports = {
  getPeople,
  getPerson
};