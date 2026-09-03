import { NextResponse } from 'next/server';

export async function validateRequestBody(schema, req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      return {
        success: false,
        response: NextResponse.json({
          success: false,
          error: 'Invalid JSON payload received in request body'
        }, { status: 400 })
      };
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      const fieldErrors = {};
      const formattedErrors = result.error.errors.map(err => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
        return {
          field,
          message: err.message
        };
      });

      return {
        success: false,
        response: NextResponse.json({
          success: false,
          error: 'Validation failed. Please verify submitted fields.',
          details: formattedErrors,
          fieldErrors
        }, { status: 400 })
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json({
        success: false,
        error: 'Internal schema parsing error: ' + error.message
      }, { status: 500 })
    };
  }
}
