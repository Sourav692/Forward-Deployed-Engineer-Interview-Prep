from collections.abc import Sequence

import numpy as np


def cosine_similarity(
    left: Sequence[float],
    right: Sequence[float],
) -> float:
    left_vector = np.asarray(left, dtype=np.float32)
    right_vector = np.asarray(right, dtype=np.float32)

    if left_vector.ndim != 1 or right_vector.ndim != 1:
        raise ValueError("Cosine similarity expects one-dimensional vectors.")

    if left_vector.shape != right_vector.shape:
        raise ValueError(
            f"Vector dimension mismatch: "
            f"{left_vector.shape} != {right_vector.shape}"
        )

    left_norm = np.linalg.norm(left_vector)
    right_norm = np.linalg.norm(right_vector)

    if left_norm == 0.0 or right_norm == 0.0:
        raise ValueError("Cosine similarity is undefined for zero vectors.")

    return float(
        np.dot(left_vector, right_vector)
        / (left_norm * right_norm)
    )