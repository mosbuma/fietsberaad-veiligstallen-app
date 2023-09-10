import type { NextApiRequest, NextApiResponse } from "next";
import type { ICrudService } from "./crud-service-interface";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export const CrudRouteHandler = async <T>(
  request: NextApiRequest,
  response: NextApiResponse,
  service: ICrudService<T>
) => {
  const id = request.query.id as string;

  let data = {};
  if ((request.method as HttpMethod) === "GET") {
    if (!id) {
      data = await service.getAll();
      const datafixed = JSON.stringify(data, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      );
      return response.status(200).json(JSON.parse(datafixed));
    } else {
    }

    const getSingleResponse = await service.getOne(id);

    if (getSingleResponse === null) {
      return response.status(404).send(null);
    }

    const datafixed2 = JSON.stringify(getSingleResponse, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
    return response.status(200).json(JSON.parse(datafixed2));
  }

  if ((request.method as HttpMethod) === "POST") {
    const data = request.body as T;
    const createResponse = await service.create(data);
    return response.status(201).json(createResponse);
  }

  if ((request.method as HttpMethod) === "PUT") {
    const data = request.body as T;
    const updateResponse = await service.update(id, data);
    return response.status(200).json(updateResponse);
  }

  if ((request.method as HttpMethod) === "DELETE") {
    const deleteResponse = await service.delete(id);
    return response.status(20).json(deleteResponse);
  }

  return response.status(405).send("Method not allowed");
};
